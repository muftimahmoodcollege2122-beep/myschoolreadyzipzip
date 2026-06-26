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
exports.TimetableController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const timetable_service_1 = require("./timetable.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
let TimetableController = class TimetableController {
    constructor(svc) {
        this.svc = svc;
    }
    createSlot(dto, tid) { return this.svc.createSlot(dto, tid); }
    sectionTimetable(id, y, tid) { return this.svc.getSectionTimetable(id, tid, y); }
    teacherTimetable(id, y, tid) { return this.svc.getTeacherTimetable(id, tid, y); }
    deleteSlot(id, tid) { return this.svc.deleteSlot(id, tid); }
};
exports.TimetableController = TimetableController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "createSlot", null);
__decorate([
    (0, common_1.Get)('section/:id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('academicYear')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "sectionTimetable", null);
__decorate([
    (0, common_1.Get)('teacher/:id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('academicYear')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "teacherTimetable", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "deleteSlot", null);
exports.TimetableController = TimetableController = __decorate([
    (0, swagger_1.ApiTags)('Timetable'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('timetable'),
    __metadata("design:paramtypes", [timetable_service_1.TimetableService])
], TimetableController);
//# sourceMappingURL=timetable.controller.js.map