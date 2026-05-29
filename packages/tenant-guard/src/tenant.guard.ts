import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * TenantGuard — ensures tenant context is present on every protected route.
 * Apply at controller or route level using @UseGuards(TenantGuard).
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      tenantId?: string;
      userId?: string;
    }>();

    if (!request.tenantId) {
      throw new UnauthorizedException('Tenant context not established');
    }

    return true;
  }
}
