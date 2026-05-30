/**
 * @CurrentTenant() — injects tenantId string into controller method parameters.
 *
 * @example
 * async getJobs(@CurrentTenant() tenantId: string) { ... }
 */
export declare const CurrentTenant: (...dataOrPipes: unknown[]) => ParameterDecorator;
/**
 * @CurrentUser() — injects userId string into controller method parameters.
 */
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
/**
 * @CurrentRole() — injects user role string into controller method parameters.
 */
export declare const CurrentRole: (...dataOrPipes: unknown[]) => ParameterDecorator;
//# sourceMappingURL=tenant.decorator.d.ts.map