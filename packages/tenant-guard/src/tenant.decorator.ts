import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @CurrentTenant() — injects tenantId string into controller method parameters.
 *
 * @example
 * async getJobs(@CurrentTenant() tenantId: string) { ... }
 */
export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{ tenantId: string }>();
    return request.tenantId;
  },
);

/**
 * @CurrentUser() — injects userId string into controller method parameters.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{ userId: string }>();
    return request.userId;
  },
);

/**
 * @CurrentRole() — injects user role string into controller method parameters.
 */
export const CurrentRole = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{ userRole: string }>();
    return request.userRole;
  },
);
