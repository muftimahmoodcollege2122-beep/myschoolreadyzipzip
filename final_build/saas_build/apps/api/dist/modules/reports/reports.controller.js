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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reports_service_1 = require("./reports.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ReportsController = class ReportsController {
    constructor(svc) {
        this.svc = svc;
    }
    async queueReportCard(dto, tid, u) {
        const jobId = await this.svc.queueReport({
            type: 'report_card',
            tenantId: tid,
            parameters: { studentId: dto.studentId, academicYear: dto.academicYear, term: dto.term },
            requestedById: u.sub,
        });
        return { success: true, jobId, message: 'Report card queued. Student will be notified when ready.' };
    }
    async bulkReportCards(dto, tid, u) {
        const jobId = await this.svc.queueReport({
            type: 'report_card',
            tenantId: tid,
            parameters: { bulk: true, academicYear: dto.academicYear, term: dto.term, schoolId: dto.schoolId },
            requestedById: u.sub,
        });
        return { success: true, jobId, message: 'Bulk report card generation started. All students will be notified.' };
    }
    async reportCardPdf(studentId, academicYear, term, tid) {
        const key = await this.svc.generateReportCardPdf(studentId, tid, academicYear, term);
        return { success: true, s3Key: key };
    }
    async exportStudents(schoolId, tid, res) {
        const buffer = await this.svc.exportStudentsToExcel(tid, schoolId, {});
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=students-${new Date().toISOString().slice(0, 10)}.xlsx`,
        });
        res.send(buffer);
    }
    async attendanceCsv(sectionId, from, to, tid, res) {
        const csv = await this.svc.exportAttendanceCsv(tid, sectionId, from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to ? new Date(to) : new Date());
        res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=attendance.csv' });
        res.send(csv);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Post)('report-card'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    (0, swagger_1.ApiOperation)({ summary: 'Queue report card PDF generation for a single student' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "queueReportCard", null);
__decorate([
    (0, common_1.Post)('report-cards/bulk'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Queue report card generation for ALL students' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "bulkReportCards", null);
__decorate([
    (0, common_1.Get)('report-card/pdf'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate and stream report card PDF immediately (sync)' }),
    __param(0, (0, common_1.Query)('studentId')),
    __param(1, (0, common_1.Query)('academicYear')),
    __param(2, (0, common_1.Query)('term')),
    __param(3, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "reportCardPdf", null);
__decorate([
    (0, common_1.Get)('students/export'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Export students to Excel' }),
    __param(0, (0, common_1.Query)('schoolId')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportStudents", null);
__decorate([
    (0, common_1.Get)('attendance/export'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    (0, swagger_1.ApiOperation)({ summary: 'Export attendance CSV' }),
    __param(0, (0, common_1.Query)('sectionId')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __param(3, (0, tenant_id_decorator_1.TenantId)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "attendanceCsv", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('Reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map