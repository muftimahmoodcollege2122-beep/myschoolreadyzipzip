"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantId = exports.Public = exports.ROLES_KEY = exports.IS_PUBLIC_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.IS_PUBLIC_KEY = 'isPublic';
exports.ROLES_KEY = 'roles';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;
exports.TenantId = (0, common_1.createParamDecorator)((_, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const tenantId = request.tenantContext?.tenantId ?? request.headers['x-tenant-id'];
    if (!tenantId)
        throw new Error('TenantId not found — is TenantContextMiddleware applied?');
    return tenantId;
});
//# sourceMappingURL=tenant-id.decorator.js.map