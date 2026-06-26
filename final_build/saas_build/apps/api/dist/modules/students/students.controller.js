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
exports.StudentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const students_service_1 = require("./students.service");
const create_student_dto_1 = require("./dto/create-student.dto");
const update_student_dto_1 = require("./dto/update-student.dto");
const student_list_query_dto_1 = require("./dto/student-list-query.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const throttle_guard_1 = require("../../common/guards/throttle.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let StudentsController = class StudentsController {
    constructor(studentsService) {
        this.studentsService = studentsService;
    }
    async create(dto, tenantId, user, req) {
        const schoolId = req.tenantContext?.planLimits?.['defaultSchoolId'] ||
            req.body.schoolId;
        return this.studentsService.create(dto, tenantId, schoolId, user.sub);
    }
    async findMe(tenantId, user) {
        return this.studentsService.findByUserId(user.sub, tenantId);
    }
    async findAll(tenantId, query, req) {
        const schoolId = req.query.schoolId;
        return this.studentsService.findAll(tenantId, schoolId, query);
    }
    async findOne(id, tenantId) {
        return this.studentsService.findOne(id, tenantId);
    }
    async update(id, dto, tenantId, user) {
        return this.studentsService.update(id, dto, tenantId, user.sub);
    }
    async deactivate(id, tenantId, user) {
        return this.studentsService.deactivate(id, tenantId, user.sub);
    }
    async erasePersonalData(id, tenantId, user) {
        return this.studentsService.erasePersonalData(id, tenantId, user.sub);
    }
};
exports.StudentsController = StudentsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    (0, throttle_guard_1.Throttle)(30, 60),
    (0, swagger_1.ApiOperation)({ summary: 'Enroll a new student' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Student enrolled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Admission number already exists' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Student limit reached — upgrade plan' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_student_dto_1.CreateStudentDto, String, Object, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)('STUDENT', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user\'s student record' }),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "findMe", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    (0, swagger_1.ApiOperation)({ summary: 'List students with filters and pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'sectionId', required: false, type: String }),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, student_list_query_dto_1.StudentListQueryDto, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Student UUID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Update student information' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_student_dto_1.UpdateStudentDto, String, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate student' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Delete)(':id/personal-data'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'GDPR: Erase student personal data (irreversible)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "erasePersonalData", null);
exports.StudentsController = StudentsController = __decorate([
    (0, swagger_1.ApiTags)('Students'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('students'),
    __metadata("design:paramtypes", [students_service_1.StudentsService])
], StudentsController);
//# sourceMappingURL=students.controller.js.map