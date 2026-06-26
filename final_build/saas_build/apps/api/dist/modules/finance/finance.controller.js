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
exports.FinanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const finance_service_1 = require("./finance.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let FinanceController = class FinanceController {
    constructor(svc) {
        this.svc = svc;
    }
    createExpense(dto, tid, u) { return this.svc.createExpense(dto, tid, u.sub); }
    listExpenses(tid, sid, cat, from, to, status) { return this.svc.listExpenses(tid, sid, cat, from, to, status); }
    approveExpense(id, tid, u) { return this.svc.approveExpense(id, tid, u.sub); }
    rejectExpense(id, tid) { return this.svc.rejectExpense(id, tid); }
    getExpenseSummary(tid, sid, period) { return this.svc.getExpenseSummary(tid, sid, period); }
    setBudget(dto, tid, u) { return this.svc.setBudget(dto, tid, u.sub); }
    listBudgets(tid, sid, period) { return this.svc.listBudgets(tid, sid, period); }
    getBudgetAnalysis(tid, sid, period) { return this.svc.getBudgetAnalysis(tid, sid, period); }
    addCashbookEntry(dto, tid, u) { return this.svc.addCashbookEntry(dto, tid, u.sub); }
    getCashbook(tid, sid, from, to) { return this.svc.getCashbook(tid, sid, from, to); }
    getDashboard(tid, sid) { return this.svc.getFinancialDashboard(tid, sid); }
    getIncomeVsExpense(tid, sid, year) { return this.svc.getIncomeVsExpense(tid, sid, year); }
    calculateTax(dto) { return this.svc.calculateTax(dto.amount, dto.taxRate, dto.taxType); }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Post)('expenses'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'STAFF'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "createExpense", null);
__decorate([
    (0, common_1.Get)('expenses'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __param(2, (0, common_1.Query)('category')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __param(5, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "listExpenses", null);
__decorate([
    (0, common_1.Put)('expenses/:id/approve'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "approveExpense", null);
__decorate([
    (0, common_1.Put)('expenses/:id/reject'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "rejectExpense", null);
__decorate([
    (0, common_1.Get)('expenses/summary'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __param(2, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getExpenseSummary", null);
__decorate([
    (0, common_1.Post)('budgets'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "setBudget", null);
__decorate([
    (0, common_1.Get)('budgets'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __param(2, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "listBudgets", null);
__decorate([
    (0, common_1.Get)('budgets/analysis'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __param(2, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getBudgetAnalysis", null);
__decorate([
    (0, common_1.Post)('cashbook'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'STAFF'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "addCashbookEntry", null);
__decorate([
    (0, common_1.Get)('cashbook'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getCashbook", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('income-vs-expense'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getIncomeVsExpense", null);
__decorate([
    (0, common_1.Post)('tax/calculate'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "calculateTax", null);
exports.FinanceController = FinanceController = __decorate([
    (0, swagger_1.ApiTags)('Finance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('finance'),
    __metadata("design:paramtypes", [finance_service_1.FinanceService])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map