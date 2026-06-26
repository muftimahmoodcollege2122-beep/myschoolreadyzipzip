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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const attendance_service_1 = require("./attendance.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AttendanceController = class AttendanceController {
    constructor(svc) {
        this.svc = svc;
    }
    markSection(sectionId, records, tid, u) {
        return this.svc.markSectionAttendance(sectionId, tid, u.sub, records);
    }
    sectionReport(sectionId, startDate, endDate, tid) {
        return this.svc.getSectionAttendanceReport(sectionId, tid, { startDate, endDate });
    }
    studentAttendance(studentId, startDate, endDate, tid) {
        const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
        const end = endDate ? new Date(endDate) : new Date();
        return this.svc.getStudentAttendance(studentId, tid, start, end);
    }
    todaySummary(tid, schoolId) {
        return this.svc.getTodayAttendanceSummary(tid, schoolId);
    }
    chronicAbsentees(schoolId, threshold, academicYear, tid) {
        return this.svc.getChronicAbsentees(schoolId, tid, threshold ?? 75, academicYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1));
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)('section/:sectionId'),
    (0, roles_decorator_1.Roles)('TEACHER', 'SCHOOL_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark attendance for a class section' }),
    __param(0, (0, common_1.Param)('sectionId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, String, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "markSection", null);
__decorate([
    (0, common_1.Get)('section/:sectionId/report'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get section attendance report' }),
    __param(0, (0, common_1.Param)('sectionId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "sectionReport", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student attendance between dates' }),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "studentAttendance", null);
__decorate([
    (0, common_1.Get)('today/summary'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    (0, swagger_1.ApiOperation)({ summary: "Today's attendance summary" }),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "todaySummary", null);
__decorate([
    (0, common_1.Get)('chronic-absentees'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    (0, swagger_1.ApiOperation)({ summary: 'Students below attendance threshold' }),
    __param(0, (0, common_1.Query)('schoolId')),
    __param(1, (0, common_1.Query)('threshold')),
    __param(2, (0, common_1.Query)('academicYear')),
    __param(3, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String, String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "chronicAbsentees", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, swagger_1.ApiTags)('Attendance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('attendance'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map