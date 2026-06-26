"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JwtAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const auth_service_1 = require("../../modules/auth/auth.service");
const tenant_id_decorator_1 = require("../decorators/tenant-id.decorator");
let JwtAuthGuard = JwtAuthGuard_1 = class JwtAuthGuard {
    constructor(authService, reflector) {
        this.authService = authService;
        this.reflector = reflector;
        this.logger = new common_1.Logger(JwtAuthGuard_1.name);
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(tenant_id_decorator_1.IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
        if (isPublic)
            return true;
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);
        if (!token)
            throw new common_1.UnauthorizedException('Authentication token required');
        try {
            const payload = await this.authService.validateAccessToken(token);
            request.user = payload;
            const tenantId = request.tenantContext?.tenantId;
            if (tenantId && payload.tid !== tenantId && payload.role !== 'SUPER_ADMIN') {
                this.logger.warn(`Tenant mismatch: token.tid=${payload.tid} context.tenantId=${tenantId}`);
                throw new common_1.UnauthorizedException('Token tenant mismatch');
            }
            return true;
        }
        catch (err) {
            if (err?.status !== 401 && err?.status !== 403) {
                this.logger.error(`Token validation error: ${err?.message ?? err}`);
            }
            throw new common_1.UnauthorizedException(err?.message ?? 'Invalid or expired token');
        }
    }
    extractToken(request) {
        const authHeader = request.headers.authorization;
        if (authHeader?.startsWith('Bearer '))
            return authHeader.slice(7);
        return request.cookies?.access_token;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = JwtAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService, core_1.Reflector])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map