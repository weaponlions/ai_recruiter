import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import axios, { AxiosRequestConfig } from 'axios';
import { FastifyRequest, FastifyReply } from 'fastify';

export interface JwtPayload {
  sub: string;        // userId
  tenantId: string;
  role: string;
  email: string;
  iat: number;
  exp: number;
}

type ServiceEnvKey =
  | 'IDENTITY_SERVICE_URL'
  | 'JOB_SERVICE_URL'
  | 'CANDIDATE_SERVICE_URL'
  | 'PIPELINE_SERVICE_URL'
  | 'DOCUMENT_SERVICE_URL'
  | 'AI_SERVICE_URL'
  | 'COMMUNICATION_SERVICE_URL'
  | 'AUDIT_SERVICE_URL';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  private readonly publicKey: string;

  constructor(private readonly config: ConfigService) {
    const keyPath = this.config.get<string>('JWT_PUBLIC_KEY_PATH');
    if (keyPath && fs.existsSync(keyPath)) {
      this.publicKey = fs.readFileSync(keyPath, 'utf8');
    } else {
      // Fallback: inline PEM from env (useful in container envs)
      this.publicKey = this.config.get<string>('JWT_PUBLIC_KEY') ?? '';
      if (!this.publicKey) {
        this.logger.warn(
          'JWT_PUBLIC_KEY_PATH not found and JWT_PUBLIC_KEY not set — JWT validation will fail',
        );
      }
    }
  }

  /**
   * Validate a Bearer JWT using RS256 public key.
   * Returns the decoded payload on success, throws UnauthorizedException otherwise.
   */
  validateToken(authHeader: string | undefined): JwtPayload {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization header');
    }

    const token = authHeader.slice(7);

    try {
      const payload = jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
      }) as JwtPayload;
      return payload;
    } catch (err: any) {
      this.logger.warn(`JWT validation failed: ${err.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Extract tenant information from a validated JWT payload.
   */
  extractTenantFromToken(payload: JwtPayload): {
    tenantId: string;
    userId: string;
    role: string;
  } {
    if (!payload.tenantId) {
      throw new UnauthorizedException('Token missing tenantId claim');
    }
    return {
      tenantId: payload.tenantId,
      userId: payload.sub,
      role: payload.role ?? 'RECRUITER',
    };
  }

  /**
   * Main proxy helper.
   *
   * Steps:
   *  1. Resolve downstream base URL from config.
   *  2. If the request carries a JWT, validate it and inject tenant headers.
   *  3. Forward the request (method, path, headers, body) via axios.
   *  4. Stream the response status + body back to the client.
   */
  async proxyRequest(
    req: FastifyRequest,
    reply: FastifyReply,
    serviceKey: ServiceEnvKey,
  ): Promise<void> {
    const baseUrl = this.config.get<string>(serviceKey);
    if (!baseUrl) {
      throw new InternalServerErrorException(
        `Downstream service URL not configured: ${serviceKey}`,
      );
    }

    // Build forward URL (strip /api/v1 prefix — downstream services also mount it)
    const url = `${baseUrl}${req.url}`;

    // Build forwarded headers
    const forwardHeaders: Record<string, string> = {};

    // Copy safe upstream headers
    const allowed = [
      'content-type',
      'accept',
      'authorization',
      'x-request-id',
      'x-correlation-id',
    ];
    for (const key of allowed) {
      const val = (req.headers as Record<string, string>)[key];
      if (val) forwardHeaders[key] = val;
    }

    // If Authorization header present, decode and inject tenant headers
    const authHeader = (req.headers as Record<string, string>)['authorization'];
    if (authHeader) {
      try {
        const payload = this.validateToken(authHeader);
        const { tenantId, userId, role } = this.extractTenantFromToken(payload);
        forwardHeaders['x-tenant-id'] = tenantId;
        forwardHeaders['x-user-id'] = userId;
        forwardHeaders['x-user-role'] = role;
      } catch {
        // Guard already handled the throw; let it fall through for public routes
      }
    }

    // Forward request
    const axiosConfig: AxiosRequestConfig = {
      method: req.method as any,
      url,
      headers: forwardHeaders,
      data: (req as any).body ?? undefined,
      validateStatus: () => true, // pass all statuses through
      responseType: 'arraybuffer',
      timeout: 30_000,
    };

    try {
      const response = await axios(axiosConfig);

      // Replay downstream response headers
      const responseHeaders = response.headers as Record<string, string>;
      for (const [k, v] of Object.entries(responseHeaders)) {
        if (['content-encoding', 'transfer-encoding'].includes(k.toLowerCase()))
          continue;
        void reply.header(k, v);
      }

      void reply.status(response.status).send(response.data);
    } catch (err: any) {
      this.logger.error(`Proxy error to ${url}: ${err.message}`);
      throw new InternalServerErrorException('Upstream service unavailable');
    }
  }
}
