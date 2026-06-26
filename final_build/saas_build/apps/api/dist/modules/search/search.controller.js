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
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const search_service_1 = require("./search.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
let SearchController = class SearchController {
    constructor(svc) {
        this.svc = svc;
    }
    global(q, tid) { return this.svc.globalSearch(q, tid); }
    students(q, classId, sectionId, tid) {
        return this.svc.studentSearch(q, tid, { classId, sectionId });
    }
    attendance(sid, from, to, tid) {
        return this.svc.getAttendanceAnalytics(tid, sid, from, to);
    }
    fees(sid, year, tid) {
        return this.svc.getFeeAnalytics(tid, sid, year ?? new Date().getFullYear());
    }
    enrollment(sid, tid) { return this.svc.getEnrollmentTrend(tid, sid); }
    exams(sid, y, tid) {
        return this.svc.getExamPerformanceAnalytics(tid, sid, y);
    }
    platform() { return this.svc.getPlatformAnalytics(); }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "global", null);
__decorate([
    (0, common_1.Get)('students'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('classId')),
    __param(2, (0, common_1.Query)('sectionId')),
    __param(3, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "students", null);
__decorate([
    (0, common_1.Get)('analytics/attendance'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, common_1.Query)('schoolId')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __param(3, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "attendance", null);
__decorate([
    (0, common_1.Get)('analytics/fees'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'ACCOUNTANT'),
    __param(0, (0, common_1.Query)('schoolId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "fees", null);
__decorate([
    (0, common_1.Get)('analytics/enrollment'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Query)('schoolId')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "enrollment", null);
__decorate([
    (0, common_1.Get)('analytics/exams'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, common_1.Query)('sectionId')),
    __param(1, (0, common_1.Query)('academicYear')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "exams", null);
__decorate([
    (0, common_1.Get)('analytics/platform'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "platform", null);
exports.SearchController = SearchController = __decorate([
    (0, swagger_1.ApiTags)('Search & Analytics'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('search'),
    __metadata("design:paramtypes", [search_service_1.SearchService])
], SearchController);
//# sourceMappingURL=search.controller.js.map