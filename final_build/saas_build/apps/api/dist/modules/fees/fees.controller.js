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
exports.FeesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fees_service_1 = require("./fees.service");
const create_invoice_dto_1 = require("./dto/create-invoice.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let FeesController = class FeesController {
    constructor(svc) {
        this.svc = svc;
    }
    createInvoice(dto, tid) { return this.svc.createInvoice(dto, tid); }
    createDirectInvoice(dto, tid) { return this.svc.createDirectInvoice(dto, tid); }
    recordPayment(dto, tid, u) {
        return this.svc.recordPayment(dto, tid, u.sub);
    }
    studentFees(id, tid) { return this.svc.getStudentFeeSummary(id, tid); }
    revenue(sid, m, y, tid) {
        return this.svc.getRevenueReport(sid, tid, m, y);
    }
    outstanding(sid, tid) { return this.svc.getOutstandingInvoices(sid, tid); }
};
exports.FeesController = FeesController;
__decorate([
    (0, common_1.Post)('invoices'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'ACCOUNTANT'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_invoice_dto_1.CreateInvoiceDto, String]),
    __metadata("design:returntype", void 0)
], FeesController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Post)('direct-invoice'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'ACCOUNTANT'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FeesController.prototype, "createDirectInvoice", null);
__decorate([
    (0, common_1.Post)('payments'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'ACCOUNTANT'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], FeesController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'ACCOUNTANT', 'STUDENT', 'PARENT'),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseUUIDPipe)),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FeesController.prototype, "studentFees", null);
__decorate([
    (0, common_1.Get)('revenue'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'ACCOUNTANT'),
    __param(0, (0, common_1.Query)('schoolId')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __param(3, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String]),
    __metadata("design:returntype", void 0)
], FeesController.prototype, "revenue", null);
__decorate([
    (0, common_1.Get)('outstanding'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'ACCOUNTANT'),
    __param(0, (0, common_1.Query)('schoolId')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FeesController.prototype, "outstanding", null);
exports.FeesController = FeesController = __decorate([
    (0, swagger_1.ApiTags)('Fees'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('fees'),
    __metadata("design:paramtypes", [fees_service_1.FeesService])
], FeesController);
//# sourceMappingURL=fees.controller.js.map