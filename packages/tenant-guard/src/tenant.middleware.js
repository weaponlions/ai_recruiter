"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
/**
 * Extracts X-Tenant-ID header and attaches it to the request.
 * Applied globally in each service's AppModule.
 *
 * Header is injected by the api-gateway after JWT validation.
 * Services MUST NOT trust client-supplied tenant IDs directly.
 */
let TenantMiddleware = class TenantMiddleware {
    use(req, _res, next) {
        const tenantId = req.headers['x-tenant-id'];
        const userId = req.headers['x-user-id'];
        const userRole = req.headers['x-user-role'];
        if (!tenantId) {
            throw new common_1.BadRequestException('Missing required header: X-Tenant-ID');
        }
        req.tenantId = tenantId;
        req.userId = userId;
        req.userRole = userRole;
        next();
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = __decorate([
    (0, common_1.Injectable)()
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map