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
exports.SchoolDataController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const school_data_service_1 = require("./school-data.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let SchoolDataController = class SchoolDataController {
    constructor(svc) {
        this.svc = svc;
    }
    schoolInfo(tid) { return this.svc.getSchoolInfo(tid); }
    updateSchool(tid, dto) { return this.svc.updateSchoolInfo(tid, dto); }
    classes(tid, sid) { return this.svc.listClasses(tid, sid); }
    createClass(tid, sid, dto) { return this.svc.createClass(tid, sid, dto); }
    updateClass(tid, id, dto) { return this.svc.updateClass(tid, id, dto); }
    sections(tid, sid, classId) { return this.svc.listSections(tid, sid, classId); }
    createSection(tid, sid, dto) { return this.svc.createSection(tid, sid, dto); }
    subjects(tid, sid) { return this.svc.listSubjects(tid, sid); }
    createSubject(tid, sid, dto) { return this.svc.createSubject(tid, sid, dto); }
    staff(tid, sid, p, l, s) { return this.svc.listStaff(tid, sid, p, l, s); }
    createStaff(tid, sid, dto) { return this.svc.createStaff(tid, sid, dto); }
    events(tid, sid, upcoming) { return this.svc.listEvents(tid, sid, upcoming === 'true'); }
    createEvent(tid, sid, dto) { return this.svc.createEvent(tid, sid, dto); }
    deleteEvent(tid, id) { return this.svc.deleteEvent(tid, id); }
    announcements(tid, p, l) { return this.svc.listAnnouncements(tid, p, l); }
    createAnnouncement(tid, u, dto) { return this.svc.createAnnouncement(tid, u?.sub ?? u?.id, dto); }
    deleteAnnouncement(tid, id) { return this.svc.deleteAnnouncement(tid, id); }
    departments(tid, sid) { return this.svc.listDepartments(tid, sid); }
    getLms(tid) { return this.svc.getLmsData(tid); }
    createCourse(tid, dto) { return this.svc.createLmsCourse(tid, dto); }
    updateCourse(tid, id, dto) { return this.svc.updateLmsCourse(tid, id, dto); }
    deleteCourse(tid, id) { return this.svc.deleteLmsCourse(tid, id); }
    getWebsite(tid) { return this.svc.getWebsiteSettings(tid); }
    saveWebsite(tid, dto) { return this.svc.saveWebsiteSettings(tid, dto); }
    backup(tid) { return this.svc.getBackup(tid); }
    getSection(tid, name) { return this.svc.getSection(tid, name); }
    createItem(tid, name, dto) { return this.svc.createSectionItem(tid, name, dto); }
    updateItem(tid, name, id, dto) { return this.svc.updateSectionItem(tid, name, id, dto); }
    deleteItem(tid, name, id) { return this.svc.deleteSectionItem(tid, name, id); }
};
exports.SchoolDataController = SchoolDataController;
__decorate([
    (0, common_1.Get)('info'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "schoolInfo", null);
__decorate([
    (0, common_1.Put)('info'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "updateSchool", null);
__decorate([
    (0, common_1.Get)('classes'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "classes", null);
__decorate([
    (0, common_1.Post)('classes'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "createClass", null);
__decorate([
    (0, common_1.Put)('classes/:id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "updateClass", null);
__decorate([
    (0, common_1.Get)('sections'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __param(2, (0, common_1.Query)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "sections", null);
__decorate([
    (0, common_1.Post)('sections'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "createSection", null);
__decorate([
    (0, common_1.Get)('subjects'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "subjects", null);
__decorate([
    (0, common_1.Post)('subjects'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "createSubject", null);
__decorate([
    (0, common_1.Get)('staff'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, String]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "staff", null);
__decorate([
    (0, common_1.Post)('staff'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "createStaff", null);
__decorate([
    (0, common_1.Get)('events'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __param(2, (0, common_1.Query)('upcoming')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "events", null);
__decorate([
    (0, common_1.Post)('events'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Delete)('events/:id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "deleteEvent", null);
__decorate([
    (0, common_1.Get)('announcements'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "announcements", null);
__decorate([
    (0, common_1.Post)('announcements'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "createAnnouncement", null);
__decorate([
    (0, common_1.Delete)('announcements/:id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "deleteAnnouncement", null);
__decorate([
    (0, common_1.Get)('departments'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "departments", null);
__decorate([
    (0, common_1.Get)('lms'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "getLms", null);
__decorate([
    (0, common_1.Post)('lms'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "createCourse", null);
__decorate([
    (0, common_1.Put)('lms/:id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "updateCourse", null);
__decorate([
    (0, common_1.Delete)('lms/:id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "deleteCourse", null);
__decorate([
    (0, common_1.Get)('website-settings'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "getWebsite", null);
__decorate([
    (0, common_1.Put)('website-settings'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "saveWebsite", null);
__decorate([
    (0, common_1.Get)('backup'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "backup", null);
__decorate([
    (0, common_1.Get)('section/:name'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "getSection", null);
__decorate([
    (0, common_1.Post)('section/:name'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Param)('name')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "createItem", null);
__decorate([
    (0, common_1.Put)('section/:name/:id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Param)('name')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)('section/:name/:id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Param)('name')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SchoolDataController.prototype, "deleteItem", null);
exports.SchoolDataController = SchoolDataController = __decorate([
    (0, swagger_1.ApiTags)('School Data'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('school'),
    __metadata("design:paramtypes", [school_data_service_1.SchoolDataService])
], SchoolDataController);
//# sourceMappingURL=school-data.controller.js.map