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
exports.HrExtendedController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const hr_extended_service_1 = require("./hr-extended.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let HrExtendedController = class HrExtendedController {
    constructor(svc) {
        this.svc = svc;
    }
    createLessonPlan(dto, tid, u) { return this.svc.createLessonPlan(dto, tid, u.sub); }
    listLessonPlans(tid, tid2, week, status) { return this.svc.listLessonPlans(tid, tid2, week, status); }
    updateLessonPlan(id, dto, tid) { return this.svc.updateLessonPlan(id, dto, tid); }
    submitLessonPlan(id, tid) { return this.svc.submitLessonPlan(id, tid); }
    approveLessonPlan(id, tid, u) { return this.svc.approveLessonPlan(id, tid, u.sub); }
    rejectLessonPlan(id, dto, tid, u) { return this.svc.rejectLessonPlan(id, dto.note, tid, u.sub); }
    createSubstitution(dto, tid, u) { return this.svc.createSubstitution(dto, tid, u.sub); }
    listSubstitutions(tid, date, tid2) { return this.svc.listSubstitutions(tid, date, tid2); }
    updateSubstitutionStatus(id, dto, tid) { return this.svc.updateSubstitutionStatus(id, dto.status, tid); }
    addTraining(dto, tid) { return this.svc.addTraining(dto, tid); }
    listTrainings(tid, tid2, status) { return this.svc.listTrainings(tid, tid2, status); }
    completeTraining(id, tid, dto) { return this.svc.completeTraining(id, tid, dto.certificateUrl); }
    addCertification(dto, tid) { return this.svc.addCertification(dto, tid); }
    listCertifications(tid, tid2) { return this.svc.listCertifications(tid, tid2); }
    verifyCertification(id, tid, u) { return this.svc.verifyCertification(id, tid, u.sub); }
    getPayrollSummary(tid, sid, month) { return this.svc.getPayrollSummary(tid, sid, month); }
    getTeacherWorkload(tid2, tid) { return this.svc.getTeacherWorkload(tid2, tid); }
};
exports.HrExtendedController = HrExtendedController;
__decorate([
    (0, common_1.Post)('lesson-plans'),
    (0, roles_decorator_1.Roles)('TEACHER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], HrExtendedController.prototype, "createLessonPlan", null);
__decorate([
    (0, common_1.Get)('lesson-plans'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('teacherId')),
    __param(2, (0, common_1.Query)('week')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], HrExtendedController.prototype, "listLessonPlans", null);
__decorate([
    (0, common_1.Put)('lesson-plans/:id'),
    (0, roles_decorator_1.Roles)('TEACHER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], HrExtendedController.prototype, "updateLessonPlan", null);
__decorate([
    (0, common_1.Put)('lesson-plans/:id/submit'),
    (0, roles_decorator_1.Roles)('TEACHER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], HrExtendedController.prototype, "submitLessonPlan", null);
__decorate([
    (0, common_1.Put)('lesson-plans/:id/approve'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], HrExtendedController.prototype, "approveLessonPlan", null);
__decorate([
    (0, common_1.Put)('lesson-plans/:id/reject'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", void 0)
], HrExtendedController.prototype, "rejectLessonPlan", null);
__decorate([
    (0, common_1.Post)('substitutions'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], HrExtendedController.prototype, "createSubstitution", null);
__decorate([
    (0, common_1.Get)('substitutions'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], HrExtendedController.prototype, "listSubstitutions", null);
__decorate([
    (0, common_1.Put)('substitutions/:id/status'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], HrExtendedController.prototype, "updateSubstitutionStatus", null);
__decorate([
    (0, common_1.Post)('training'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], HrExtendedController.prototype, "addTraining", null);
__decorate([
    (0, common_1.Get)('training'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('teacherId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], HrExtendedController.prototype, "listTrainings", null);
__decorate([
    (0, common_1.Put)('training/:id/complete'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], HrExtendedController.prototype, "completeTraining", null);
__decorate([
    (0, common_1.Post)('certifications'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], HrExtendedController.prototype, "addCertification", null);
__decorate([
    (0, common_1.Get)('certifications'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], HrExtendedController.prototype, "listCertifications", null);
__decorate([
    (0, common_1.Put)('certifications/:id/verify'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], HrExtendedController.prototype, "verifyCertification", null);
__decorate([
    (0, common_1.Get)('payroll'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], HrExtendedController.prototype, "getPayrollSummary", null);
__decorate([
    (0, common_1.Get)('workload/:teacherId'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, common_1.Param)('teacherId')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], HrExtendedController.prototype, "getTeacherWorkload", null);
exports.HrExtendedController = HrExtendedController = __decorate([
    (0, swagger_1.ApiTags)('HR Extended'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('hr'),
    __metadata("design:paramtypes", [hr_extended_service_1.HrExtendedService])
], HrExtendedController);
//# sourceMappingURL=hr-extended.controller.js.map