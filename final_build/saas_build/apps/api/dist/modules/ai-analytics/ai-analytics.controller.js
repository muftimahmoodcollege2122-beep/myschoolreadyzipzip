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
exports.AiAnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_analytics_service_1 = require("./ai-analytics.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
let AiAnalyticsController = class AiAnalyticsController {
    constructor(svc) {
        this.svc = svc;
    }
    getDropoutRisk(tid, sid) { return this.svc.getDropoutRiskStudents(tid, sid); }
    getPerformancePrediction(sid, tid) { return this.svc.getPerformancePrediction(tid, sid); }
    getAttendanceAnalytics(tid, sid) { return this.svc.getAttendanceAnalytics(tid, sid); }
    getFeeAnalytics(tid) { return this.svc.getFeeAnalytics(tid); }
    getSchoolPerformance(tid) { return this.svc.getSchoolPerformanceDashboard(tid); }
    getBenchmarking(tid) { return this.svc.getBenchmarkingData(tid); }
    generateReport(dto, tid) { return this.svc.generateAiReport(dto.type, tid, dto.params ?? {}); }
};
exports.AiAnalyticsController = AiAnalyticsController;
__decorate([
    (0, common_1.Get)('dropout-risk'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AiAnalyticsController.prototype, "getDropoutRisk", null);
__decorate([
    (0, common_1.Get)('performance/:studentId'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'),
    __param(0, (0, common_1.Query)('studentId')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AiAnalyticsController.prototype, "getPerformancePrediction", null);
__decorate([
    (0, common_1.Get)('attendance'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AiAnalyticsController.prototype, "getAttendanceAnalytics", null);
__decorate([
    (0, common_1.Get)('fees'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiAnalyticsController.prototype, "getFeeAnalytics", null);
__decorate([
    (0, common_1.Get)('school-performance'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiAnalyticsController.prototype, "getSchoolPerformance", null);
__decorate([
    (0, common_1.Get)('benchmarking'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiAnalyticsController.prototype, "getBenchmarking", null);
__decorate([
    (0, common_1.Post)('generate-report'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AiAnalyticsController.prototype, "generateReport", null);
exports.AiAnalyticsController = AiAnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('AI Analytics'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('ai-analytics'),
    __metadata("design:paramtypes", [ai_analytics_service_1.AiAnalyticsService])
], AiAnalyticsController);
//# sourceMappingURL=ai-analytics.controller.js.map