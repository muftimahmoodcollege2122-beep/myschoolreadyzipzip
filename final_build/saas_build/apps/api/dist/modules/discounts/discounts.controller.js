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
exports.DiscountsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const discounts_service_1 = require("./discounts.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let DiscountsController = class DiscountsController {
    constructor(svc) {
        this.svc = svc;
    }
    createDiscount(dto, tid, u) { return this.svc.createDiscount(dto, tid, u.sub); }
    listDiscounts(tid) { return this.svc.listDiscounts(tid); }
    updateDiscount(id, dto, tid, u) { return this.svc.updateDiscount(id, dto, tid, u.sub); }
    deleteDiscount(id, tid) { return this.svc.deleteDiscount(id, tid); }
    createScholarship(dto, tid, u) { return this.svc.createScholarship(dto, tid, u.sub); }
    listScholarships(tid) { return this.svc.listScholarships(tid); }
    updateScholarship(id, dto, tid) { return this.svc.updateScholarship(id, dto, tid); }
    grantScholarship(dto, tid, u) { return this.svc.grantScholarship(dto, tid, u.sub); }
    listGrants(tid, sid) { return this.svc.listGrants(tid, sid); }
    revokeGrant(id, tid, u) { return this.svc.revokeGrant(id, tid, u.sub); }
    createInstallmentPlan(dto, tid, u) { return this.svc.createInstallmentPlan(dto, tid, u.sub); }
    listInstallmentPlans(tid, sid) { return this.svc.listInstallmentPlans(tid, sid); }
    payInstallment(id, tid, u) { return this.svc.recordInstallmentPayment(id, tid, u.sub); }
    createCoupon(dto) { return this.svc.createCoupon(dto); }
    listCoupons() { return this.svc.listCoupons(); }
    validateCoupon(dto) { return this.svc.validateCoupon(dto.code, dto.amount, dto.plan); }
};
exports.DiscountsController = DiscountsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], DiscountsController.prototype, "createDiscount", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiscountsController.prototype, "listDiscounts", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", void 0)
], DiscountsController.prototype, "updateDiscount", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DiscountsController.prototype, "deleteDiscount", null);
__decorate([
    (0, common_1.Post)('scholarships'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], DiscountsController.prototype, "createScholarship", null);
__decorate([
    (0, common_1.Get)('scholarships'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiscountsController.prototype, "listScholarships", null);
__decorate([
    (0, common_1.Put)('scholarships/:id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], DiscountsController.prototype, "updateScholarship", null);
__decorate([
    (0, common_1.Post)('scholarships/grant'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], DiscountsController.prototype, "grantScholarship", null);
__decorate([
    (0, common_1.Get)('scholarships/grants'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DiscountsController.prototype, "listGrants", null);
__decorate([
    (0, common_1.Put)('scholarships/grants/:id/revoke'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], DiscountsController.prototype, "revokeGrant", null);
__decorate([
    (0, common_1.Post)('installment-plans'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], DiscountsController.prototype, "createInstallmentPlan", null);
__decorate([
    (0, common_1.Get)('installment-plans'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DiscountsController.prototype, "listInstallmentPlans", null);
__decorate([
    (0, common_1.Post)('installments/:id/pay'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], DiscountsController.prototype, "payInstallment", null);
__decorate([
    (0, common_1.Post)('coupons'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DiscountsController.prototype, "createCoupon", null);
__decorate([
    (0, common_1.Get)('coupons'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DiscountsController.prototype, "listCoupons", null);
__decorate([
    (0, common_1.Post)('coupons/validate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DiscountsController.prototype, "validateCoupon", null);
exports.DiscountsController = DiscountsController = __decorate([
    (0, swagger_1.ApiTags)('Discounts & Scholarships'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('discounts'),
    __metadata("design:paramtypes", [discounts_service_1.DiscountsService])
], DiscountsController);
//# sourceMappingURL=discounts.controller.js.map