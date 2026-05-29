import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Extracts X-Tenant-ID header and attaches it to the request.
 * Applied globally in each service's AppModule.
 *
 * Header is injected by the api-gateway after JWT validation.
 * Services MUST NOT trust client-supplied tenant IDs directly.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(
    req: FastifyRequest['raw'] & { tenantId?: string; userId?: string; userRole?: string },
    _res: FastifyReply['raw'],
    next: () => void,
  ): void {
    const tenantId = (req.headers as Record<string, string>)['x-tenant-id'];
    const userId = (req.headers as Record<string, string>)['x-user-id'];
    const userRole = (req.headers as Record<string, string>)['x-user-role'];

    if (!tenantId) {
      throw new BadRequestException('Missing required header: X-Tenant-ID');
    }

    req.tenantId = tenantId;
    req.userId = userId;
    req.userRole = userRole;

    next();
  }
}
