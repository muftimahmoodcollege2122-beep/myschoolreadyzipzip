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
exports.StudentRecordsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const student_records_service_1 = require("./student-records.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let StudentRecordsController = class StudentRecordsController {
    constructor(svc) {
        this.svc = svc;
    }
    logBehavior(dto, tid, u) { return this.svc.logBehavior(dto, tid, u.sub); }
    getBehavior(sid, tid, type) { return this.svc.getBehaviorHistory(sid, tid, type); }
    resolveBehavior(id, tid, u) { return this.svc.resolveBehavior(id, tid, u.sub); }
    getBehaviorStats(tid, sid) { return this.svc.getBehaviorStats(tid, sid); }
    upsertMedical(sid, dto, tid, u) { return this.svc.upsertMedical(sid, dto, tid, u.sub); }
    getMedical(sid, tid) { return this.svc.getMedical(sid, tid); }
    addAchievement(dto, tid, u) { return this.svc.addAchievement(dto, tid, u.sub); }
    getAchievements(sid, tid) { return this.svc.getAchievements(sid, tid); }
    deleteAchievement(id, tid) { return this.svc.deleteAchievement(id, tid); }
    issueWarning(dto, tid, u) { return this.svc.issueWarning(dto, tid, u.sub); }
    getWarnings(sid, tid, active) { return this.svc.getWarnings(sid, tid, active !== 'false'); }
    resolveWarning(id, tid, u) { return this.svc.resolveWarning(id, tid, u.sub); }
    getDisciplinarySummary(sid, tid) { return this.svc.getDisciplinarySummary(sid, tid); }
};
exports.StudentRecordsController = StudentRecordsController;
__decorate([
    (0, common_1.Post)('behavior'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], StudentRecordsController.prototype, "logBehavior", null);
__decorate([
    (0, common_1.Get)('behavior/:studentId'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'PARENT'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], StudentRecordsController.prototype, "getBehavior", null);
__decorate([
    (0, common_1.Put)('behavior/:id/resolve'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], StudentRecordsController.prototype, "resolveBehavior", null);
__decorate([
    (0, common_1.Get)('behavior/stats/overview'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StudentRecordsController.prototype, "getBehaviorStats", null);
__decorate([
    (0, common_1.Put)('medical/:studentId'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", void 0)
], StudentRecordsController.prototype, "upsertMedical", null);
__decorate([
    (0, common_1.Get)('medical/:studentId'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StudentRecordsController.prototype, "getMedical", null);
__decorate([
    (0, common_1.Post)('achievements'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], StudentRecordsController.prototype, "addAchievement", null);
__decorate([
    (0, common_1.Get)('achievements/:studentId'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StudentRecordsController.prototype, "getAchievements", null);
__decorate([
    (0, common_1.Delete)('achievements/:id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StudentRecordsController.prototype, "deleteAchievement", null);
__decorate([
    (0, common_1.Post)('warnings'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], StudentRecordsController.prototype, "issueWarning", null);
__decorate([
    (0, common_1.Get)('warnings/:studentId'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'PARENT'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, common_1.Query)('active')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], StudentRecordsController.prototype, "getWarnings", null);
__decorate([
    (0, common_1.Put)('warnings/:id/resolve'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], StudentRecordsController.prototype, "resolveWarning", null);
__decorate([
    (0, common_1.Get)('summary/:studentId'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'PARENT'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StudentRecordsController.prototype, "getDisciplinarySummary", null);
exports.StudentRecordsController = StudentRecordsController = __decorate([
    (0, swagger_1.ApiTags)('Student Records'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('student-records'),
    __metadata("design:paramtypes", [student_records_service_1.StudentRecordsService])
], StudentRecordsController);
//# sourceMappingURL=student-records.controller.js.map