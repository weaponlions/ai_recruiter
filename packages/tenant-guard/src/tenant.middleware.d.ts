import { NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
/**
 * Extracts X-Tenant-ID header and attaches it to the request.
 * Applied globally in each service's AppModule.
 *
 * Header is injected by the api-gateway after JWT validation.
 * Services MUST NOT trust client-supplied tenant IDs directly.
 */
export declare class TenantMiddleware implements NestMiddleware {
    use(req: FastifyRequest['raw'] & {
        tenantId?: string;
        userId?: string;
        userRole?: string;
    }, _res: FastifyReply['raw'], next: () => void): void;
}
//# sourceMappingURL=tenant.middleware.d.ts.map