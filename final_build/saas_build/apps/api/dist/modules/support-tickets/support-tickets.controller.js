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
exports.SupportTicketsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const support_tickets_service_1 = require("./support-tickets.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let SupportTicketsController = class SupportTicketsController {
    constructor(svc) {
        this.svc = svc;
    }
    createTicket(dto, tid, u) { return this.svc.createTicket(dto, tid, u.sub); }
    listTickets(tid, s, p, c, page) { return this.svc.listTickets(tid, s, p, c, undefined, page ? +page : 1); }
    getStats(tid) { return this.svc.getTicketStats(tid); }
    getTicket(id, tid) { return this.svc.getTicket(id, tid); }
    respondToTicket(id, dto, tid, u) { return this.svc.respondToTicket(id, dto, tid, u.sub); }
    updateStatus(id, dto, tid, u) { return this.svc.updateTicketStatus(id, dto.status, tid, u.sub); }
    assignTicket(id, dto, tid) { return this.svc.assignTicket(id, dto.assignedToId, tid); }
    rateTicket(id, dto, tid) { return this.svc.rateTicket(id, dto.satisfaction, tid); }
};
exports.SupportTicketsController = SupportTicketsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SupportTicketsController.prototype, "createTicket", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('priority')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SupportTicketsController.prototype, "listTickets", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SupportTicketsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SupportTicketsController.prototype, "getTicket", null);
__decorate([
    (0, common_1.Post)(':id/respond'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", void 0)
], SupportTicketsController.prototype, "respondToTicket", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", void 0)
], SupportTicketsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Put)(':id/assign'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], SupportTicketsController.prototype, "assignTicket", null);
__decorate([
    (0, common_1.Put)(':id/rate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], SupportTicketsController.prototype, "rateTicket", null);
exports.SupportTicketsController = SupportTicketsController = __decorate([
    (0, swagger_1.ApiTags)('Support Tickets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('support-tickets'),
    __metadata("design:paramtypes", [support_tickets_service_1.SupportTicketsService])
], SupportTicketsController);
//# sourceMappingURL=support-tickets.controller.js.map