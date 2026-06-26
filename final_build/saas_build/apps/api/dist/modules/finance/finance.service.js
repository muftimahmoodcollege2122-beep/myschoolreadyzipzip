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
var FinanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../../common/audit/audit.service");
let FinanceService = FinanceService_1 = class FinanceService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
        this.logger = new common_1.Logger(FinanceService_1.name);
    }
    async createExpense(dto, tenantId, createdById) {
        const expense = await this.prisma.expense.create({
            data: { tenantId, schoolId: dto.schoolId, category: dto.category, description: dto.description, amount: dto.amount,
                vendor: dto.vendor, receiptUrl: dto.receiptUrl, expenseDate: new Date(dto.expenseDate), createdById },
        });
        await this.audit.log({ tenantId, userId: createdById, action: 'CREATE', entity: 'Expense', entityId: expense.id, after: dto });
        return expense;
    }
    async listExpenses(tenantId, schoolId, category, from, to, status) {
        return this.prisma.expense.findMany({
            where: { tenantId, ...(schoolId && { schoolId }), ...(category && { category }), ...(status && { status }),
                ...(from && to && { expenseDate: { gte: new Date(from), lte: new Date(to) } }) },
            orderBy: { expenseDate: 'desc' },
        });
    }
    async approveExpense(id, tenantId, approvedById) {
        const e = await this.prisma.expense.findFirst({ where: { id, tenantId } });
        if (!e)
            throw new common_1.NotFoundException('Expense not found');
        return this.prisma.expense.update({ where: { id }, data: { status: 'APPROVED', approvedById, approvedAt: new Date() } });
    }
    async rejectExpense(id, tenantId) {
        return this.prisma.expense.update({ where: { id }, data: { status: 'REJECTED' } });
    }
    async getExpenseSummary(tenantId, schoolId, period) {
        const [month, year] = [period.split('-')[1], period.split('-')[0]];
        const from = new Date(`${year}-${month}-01`);
        const to = new Date(from.getFullYear(), from.getMonth() + 1, 0);
        const expenses = await this.prisma.expense.findMany({ where: { tenantId, schoolId, expenseDate: { gte: from, lte: to }, status: { in: ['APPROVED', 'PAID'] } } });
        const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
        const byCategory = expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + Number(e.amount); return acc; }, {});
        return { total, byCategory, count: expenses.length, period };
    }
    async setBudget(dto, tenantId, createdById) {
        return this.prisma.budget.upsert({
            where: { tenantId_schoolId_category_period: { tenantId, schoolId: dto.schoolId, category: dto.category, period: dto.period } },
            create: { tenantId, schoolId: dto.schoolId, category: dto.category, period: dto.period, allocated: dto.allocated, spent: 0, notes: dto.notes, createdById },
            update: { allocated: dto.allocated, notes: dto.notes, updatedAt: new Date() },
        });
    }
    async listBudgets(tenantId, schoolId, period) {
        return this.prisma.budget.findMany({ where: { tenantId, schoolId, ...(period && { period }) }, orderBy: { category: 'asc' } });
    }
    async getBudgetAnalysis(tenantId, schoolId, period) {
        const budgets = await this.prisma.budget.findMany({ where: { tenantId, schoolId, period } });
        const totalAllocated = budgets.reduce((s, b) => s + Number(b.allocated), 0);
        const totalSpent = budgets.reduce((s, b) => s + Number(b.spent), 0);
        return { budgets, totalAllocated, totalSpent, remaining: totalAllocated - totalSpent, utilizationRate: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0 };
    }
    async addCashbookEntry(dto, tenantId, createdById) {
        return this.prisma.cashbookEntry.create({
            data: { tenantId, schoolId: dto.schoolId, type: dto.type, category: dto.category, description: dto.description, amount: dto.amount, reference: dto.reference, entryDate: new Date(dto.entryDate), createdById },
        });
    }
    async getCashbook(tenantId, schoolId, from, to) {
        const entries = await this.prisma.cashbookEntry.findMany({
            where: { tenantId, schoolId, entryDate: { gte: new Date(from), lte: new Date(to) } },
            orderBy: { entryDate: 'asc' },
        });
        const income = entries.filter(e => e.type === 'INCOME').reduce((s, e) => s + Number(e.amount), 0);
        const expense = entries.filter(e => e.type === 'EXPENSE').reduce((s, e) => s + Number(e.amount), 0);
        return { entries, income, expense, balance: income - expense, period: { from, to } };
    }
    async getFinancialDashboard(tenantId, schoolId) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const [expenses, budgets, cashbook, fees] = await Promise.all([
            this.getExpenseSummary(tenantId, schoolId, currentMonth),
            this.listBudgets(tenantId, schoolId, currentMonth),
            this.getCashbook(tenantId, schoolId, `${currentMonth}-01`, `${currentMonth}-31`),
            this.prisma.feeInvoice.aggregate({ where: { tenantId }, _sum: { amount: true, amountPaid: true } }),
        ]);
        return { expenses, budgets, cashbook, fees: { total: fees._sum.amount, collected: fees._sum.amountPaid, outstanding: Number(fees._sum.amount ?? 0) - Number(fees._sum.amountPaid ?? 0) } };
    }
    async getIncomeVsExpense(tenantId, schoolId, year) {
        const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
        const data = await Promise.all(months.map(async (m) => {
            const from = new Date(`${year}-${m}-01`);
            const to = new Date(from.getFullYear(), from.getMonth() + 1, 0);
            const [income, expense] = await Promise.all([
                this.prisma.payment.aggregate({ where: { tenantId, createdAt: { gte: from, lte: to } }, _sum: { amount: true } }),
                this.prisma.expense.aggregate({ where: { tenantId, schoolId, expenseDate: { gte: from, lte: to }, status: { in: ['APPROVED', 'PAID'] } }, _sum: { amount: true } }),
            ]);
            return { month: `${year}-${m}`, income: Number(income._sum.amount ?? 0), expense: Number(expense._sum.amount ?? 0) };
        }));
        return data;
    }
    async calculateTax(amount, taxRate, taxType = 'EXCLUSIVE') {
        if (taxType === 'EXCLUSIVE') {
            const taxAmount = (amount * taxRate) / 100;
            return { baseAmount: amount, taxAmount, totalAmount: amount + taxAmount, taxRate, taxType };
        }
        else {
            const taxAmount = amount - (amount / (1 + taxRate / 100));
            return { baseAmount: amount - taxAmount, taxAmount, totalAmount: amount, taxRate, taxType };
        }
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = FinanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map