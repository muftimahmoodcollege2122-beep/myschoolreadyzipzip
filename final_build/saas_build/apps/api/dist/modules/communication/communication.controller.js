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
exports.CommunicationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const communication_service_1 = require("./communication.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let CommunicationController = class CommunicationController {
    constructor(svc) {
        this.svc = svc;
    }
    send(dto, u, tid) { return this.svc.sendMessage(dto, u.sub, tid); }
    threads(u, tid) { return this.svc.getThreads(u.sub, tid); }
    thread(id, u, tid) { return this.svc.getThread(id, u.sub, tid); }
    announcements(sid, tid) { return this.svc.getAnnouncements(tid, sid); }
    createAnnouncement(dto, u, tid) { return this.svc.createAnnouncement(dto, u.sub, tid); }
};
exports.CommunicationController = CommunicationController;
__decorate([
    (0, common_1.Post)('messages'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "send", null);
__decorate([
    (0, common_1.Get)('threads'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "threads", null);
__decorate([
    (0, common_1.Get)('threads/:id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "thread", null);
__decorate([
    (0, common_1.Get)('announcements'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'),
    __param(0, (0, common_1.Query)('schoolId')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "announcements", null);
__decorate([
    (0, common_1.Post)('announcements'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "createAnnouncement", null);
exports.CommunicationController = CommunicationController = __decorate([
    (0, swagger_1.ApiTags)('Communication'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('communication'),
    __metadata("design:paramtypes", [communication_service_1.CommunicationService])
], CommunicationController);
//# sourceMappingURL=communication.controller.js.map