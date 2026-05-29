import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GatewayService } from '../../gateway/gateway.service';
import { FastifyRequest } from 'fastify';

/**
 * JwtAuthGuard
 *
 * Applied to all protected routes in the api-gateway.
 * Validates the RS256 Bearer token and decorates the Fastify request
 * with `user` (containing tenantId, userId, role) so controllers can
 * access it if needed.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly gatewayService: GatewayService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authHeader = (request.headers as Record<string, string>)[
      'authorization'
    ];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    // Validate the JWT and extract claims
    const payload = this.gatewayService.validateToken(authHeader);
    const claims = this.gatewayService.extractTenantFromToken(payload);

    // Attach to request for downstream use
    (request as any).user = claims;

    return true;
  }
}
