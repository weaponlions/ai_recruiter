import { CanActivate, ExecutionContext } from '@nestjs/common';
/**
 * TenantGuard — ensures tenant context is present on every protected route.
 * Apply at controller or route level using @UseGuards(TenantGuard).
 */
export declare class TenantGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
//# sourceMappingURL=tenant.guard.d.ts.map