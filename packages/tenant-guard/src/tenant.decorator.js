"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentRole = exports.CurrentUser = exports.CurrentTenant = void 0;
const common_1 = require("@nestjs/common");
/**
 * @CurrentTenant() — injects tenantId string into controller method parameters.
 *
 * @example
 * async getJobs(@CurrentTenant() tenantId: string) { ... }
 */
exports.CurrentTenant = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId;
});
/**
 * @CurrentUser() — injects userId string into controller method parameters.
 */
exports.CurrentUser = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.userId;
});
/**
 * @CurrentRole() — injects user role string into controller method parameters.
 */
exports.CurrentRole = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.userRole;
});
//# sourceMappingURL=tenant.decorator.js.map