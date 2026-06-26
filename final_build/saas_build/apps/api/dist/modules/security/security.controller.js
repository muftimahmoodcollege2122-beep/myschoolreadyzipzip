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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const security_service_1 = require("./security.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let SecurityController = class SecurityController {
    constructor(svc) {
        this.svc = svc;
    }
    setupMfa(u) { return this.svc.generateMfaSecret(u.sub); }
    enableMfa(dto, u) { return this.svc.enableMfa(u.sub, dto.token); }
    disableMfa(dto, u) { return this.svc.disableMfa(u.sub, dto.token); }
    verifyMfa(dto, u) { return this.svc.verifyMfaToken(u.sub, dto.token); }
    addIpRestriction(dto, tid, u) { return this.svc.addIpRestriction(dto, tid, u.sub); }
    listIpRestrictions(tid, type) { return this.svc.listIpRestrictions(tid, type); }
    removeIpRestriction(id, tid) { return this.svc.removeIpRestriction(id, tid); }
    getLoginHistory(tid, u, limit) { return this.svc.getLoginHistory(u.sub, tid, limit ? +limit : 20); }
    getTenantLoginStats(tid) { return this.svc.getTenantLoginStats(tid); }
    getSuspiciousActivities(tid, resolved) { return this.svc.getSuspiciousActivities(tid, resolved === 'true'); }
    resolveSuspicious(id, tid, u) { return this.svc.resolveSuspiciousActivity(id, tid, u.sub); }
    getDashboard(tid) { return this.svc.getSecurityDashboard(tid); }
    getAuditLogs(tid, entity, uid, page) { return this.svc.getAuditLogs(tid, entity, uid, page ? +page : 1); }
    getComplianceReport(tid) { return this.svc.getComplianceReport(tid); }
};
exports.SecurityController = SecurityController;
__decorate([
    (0, common_1.Post)('mfa/setup'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "setupMfa", null);
__decorate([
    (0, common_1.Post)('mfa/enable'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "enableMfa", null);
__decorate([
    (0, common_1.Post)('mfa/disable'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "disableMfa", null);
__decorate([
    (0, common_1.Post)('mfa/verify'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "verifyMfa", null);
__decorate([
    (0, common_1.Post)('ip-restrictions'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "addIpRestriction", null);
__decorate([
    (0, common_1.Get)('ip-restrictions'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "listIpRestrictions", null);
__decorate([
    (0, common_1.Delete)('ip-restrictions/:id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "removeIpRestriction", null);
__decorate([
    (0, common_1.Get)('login-history'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getLoginHistory", null);
__decorate([
    (0, common_1.Get)('login-stats'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getTenantLoginStats", null);
__decorate([
    (0, common_1.Get)('suspicious'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('resolved')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getSuspiciousActivities", null);
__decorate([
    (0, common_1.Put)('suspicious/:id/resolve'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "resolveSuspicious", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('entity')),
    __param(2, (0, common_1.Query)('userId')),
    __param(3, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('compliance'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getComplianceReport", null);
exports.SecurityController = SecurityController = __decorate([
    (0, swagger_1.ApiTags)('Security'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('security'),
    __metadata("design:paramtypes", [security_service_1.SecurityService])
], SecurityController);
//# sourceMappingURL=security.controller.js.map