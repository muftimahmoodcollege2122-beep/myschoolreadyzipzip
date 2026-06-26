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
exports.GradesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const grades_service_1 = require("./grades.service");
const create_grade_dto_1 = require("./dto/create-grade.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let GradesController = class GradesController {
    constructor(svc) {
        this.svc = svc;
    }
    create(dto, tid, u) {
        return this.svc.createGrade(dto, tid, u.sub);
    }
    studentGrades(studentId, academicYear, term, tid) {
        return this.svc.getStudentGrades(studentId, tid, academicYear, term);
    }
    reportCard(studentId, academicYear, term, tid) {
        return this.svc.getStudentReportCard(studentId, tid, academicYear, term);
    }
    gradebook(sectionId, classSubjectId, term, academicYear, tid) {
        return this.svc.getSectionGradebook(sectionId, classSubjectId, tid, term, academicYear);
    }
};
exports.GradesController = GradesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('TEACHER', 'SCHOOL_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a grade entry' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_grade_dto_1.CreateGradeDto, String, Object]),
    __metadata("design:returntype", void 0)
], GradesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student grades for a year/term' }),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('academicYear')),
    __param(2, (0, common_1.Query)('term')),
    __param(3, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], GradesController.prototype, "studentGrades", null);
__decorate([
    (0, common_1.Get)('student/:studentId/report-card'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Get full report card for a student' }),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('academicYear')),
    __param(2, (0, common_1.Query)('term')),
    __param(3, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], GradesController.prototype, "reportCard", null);
__decorate([
    (0, common_1.Get)('section/:sectionId/gradebook'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get gradebook for entire section' }),
    __param(0, (0, common_1.Param)('sectionId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('classSubjectId')),
    __param(2, (0, common_1.Query)('term')),
    __param(3, (0, common_1.Query)('academicYear')),
    __param(4, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], GradesController.prototype, "gradebook", null);
exports.GradesController = GradesController = __decorate([
    (0, swagger_1.ApiTags)('Grades'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('grades'),
    __metadata("design:paramtypes", [grades_service_1.GradesService])
], GradesController);
//# sourceMappingURL=grades.controller.js.map