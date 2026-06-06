import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  // ── Expenses ───────────────────────────────────────────────
  async createExpense(dto: any, tenantId: string, createdById: string) {
    const expense = await this.prisma.expense.create({
      data: { tenantId, schoolId: dto.schoolId, category: dto.category, description: dto.description, amount: dto.amount,
              vendor: dto.vendor, receiptUrl: dto.receiptUrl, expenseDate: new Date(dto.expenseDate), createdById },
    });
    await this.audit.log({ tenantId, userId: createdById, action: 'CREATE', entity: 'Expense', entityId: expense.id, after: dto });
    return expense;
  }

  async listExpenses(tenantId: string, schoolId?: string, category?: string, from?: string, to?: string, status?: string) {
    return this.prisma.expense.findMany({
      where: { tenantId, ...(schoolId && { schoolId }), ...(category && { category }), ...(status && { status }),
               ...(from && to && { expenseDate: { gte: new Date(from), lte: new Date(to) } }) },
      orderBy: { expenseDate: 'desc' },
    });
  }

  async approveExpense(id: string, tenantId: string, approvedById: string) {
    const e = await this.prisma.expense.findFirst({ where: { id, tenantId } });
    if (!e) throw new NotFoundException('Expense not found');
    return this.prisma.expense.update({ where: { id }, data: { status: 'APPROVED', approvedById, approvedAt: new Date() } });
  }

  async rejectExpense(id: string, tenantId: string) {
    return this.prisma.expense.update({ where: { id }, data: { status: 'REJECTED' } });
  }

  async getExpenseSummary(tenantId: string, schoolId: string, period: string) {
    const [month, year] = [period.split('-')[1], period.split('-')[0]];
    const from = new Date(`${year}-${month}-01`);
    const to = new Date(from.getFullYear(), from.getMonth() + 1, 0);
    const expenses = await this.prisma.expense.findMany({ where: { tenantId, schoolId, expenseDate: { gte: from, lte: to }, status: { in: ['APPROVED', 'PAID'] } } });
    const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const byCategory = expenses.reduce((acc: any, e) => { acc[e.category] = (acc[e.category] || 0) + Number(e.amount); return acc; }, {});
    return { total, byCategory, count: expenses.length, period };
  }

  // ── Budget ─────────────────────────────────────────────────
  async setBudget(dto: any, tenantId: string, createdById: string) {
    return this.prisma.budget.upsert({
      where: { tenantId_schoolId_category_period: { tenantId, schoolId: dto.schoolId, category: dto.category, period: dto.period } },
      create: { tenantId, schoolId: dto.schoolId, category: dto.category, period: dto.period, allocated: dto.allocated, spent: 0, notes: dto.notes, createdById },
      update: { allocated: dto.allocated, notes: dto.notes, updatedAt: new Date() },
    });
  }

  async listBudgets(tenantId: string, schoolId: string, period?: string) {
    return this.prisma.budget.findMany({ where: { tenantId, schoolId, ...(period && { period }) }, orderBy: { category: 'asc' } });
  }

  async getBudgetAnalysis(tenantId: string, schoolId: string, period: string) {
    const budgets = await this.prisma.budget.findMany({ where: { tenantId, schoolId, period } });
    const totalAllocated = budgets.reduce((s, b) => s + Number(b.allocated), 0);
    const totalSpent = budgets.reduce((s, b) => s + Number(b.spent), 0);
    return { budgets, totalAllocated, totalSpent, remaining: totalAllocated - totalSpent, utilizationRate: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0 };
  }

  // ── Cashbook ───────────────────────────────────────────────
  async addCashbookEntry(dto: any, tenantId: string, createdById: string) {
    return this.prisma.cashbookEntry.create({
      data: { tenantId, schoolId: dto.schoolId, type: dto.type, category: dto.category, description: dto.description, amount: dto.amount, reference: dto.reference, entryDate: new Date(dto.entryDate), createdById },
    });
  }

  async getCashbook(tenantId: string, schoolId: string, from: string, to: string) {
    const entries = await this.prisma.cashbookEntry.findMany({
      where: { tenantId, schoolId, entryDate: { gte: new Date(from), lte: new Date(to) } },
      orderBy: { entryDate: 'asc' },
    });
    const income = entries.filter(e => e.type === 'INCOME').reduce((s, e) => s + Number(e.amount), 0);
    const expense = entries.filter(e => e.type === 'EXPENSE').reduce((s, e) => s + Number(e.amount), 0);
    return { entries, income, expense, balance: income - expense, period: { from, to } };
  }

  // ── Financial Reports ──────────────────────────────────────
  async getFinancialDashboard(tenantId: string, schoolId: string) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [expenses, budgets, cashbook, fees] = await Promise.all([
      this.getExpenseSummary(tenantId, schoolId, currentMonth),
      this.listBudgets(tenantId, schoolId, currentMonth),
      this.getCashbook(tenantId, schoolId, `${currentMonth}-01`, `${currentMonth}-31`),
      this.prisma.feeInvoice.aggregate({ where: { tenantId }, _sum: { amount: true, amountPaid: true } }),
    ]);
    return { expenses, budgets, cashbook, fees: { total: fees._sum.amount, collected: fees._sum.amountPaid, outstanding: Number(fees._sum.amount ?? 0) - Number(fees._sum.amountPaid ?? 0) } };
  }

  async getIncomeVsExpense(tenantId: string, schoolId: string, year: string) {
    const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
    const data = await Promise.all(months.map(async m => {
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

  // ── Tax System ─────────────────────────────────────────────
  async calculateTax(amount: number, taxRate: number, taxType: 'INCLUSIVE' | 'EXCLUSIVE' = 'EXCLUSIVE') {
    if (taxType === 'EXCLUSIVE') {
      const taxAmount = (amount * taxRate) / 100;
      return { baseAmount: amount, taxAmount, totalAmount: amount + taxAmount, taxRate, taxType };
    } else {
      const taxAmount = amount - (amount / (1 + taxRate / 100));
      return { baseAmount: amount - taxAmount, taxAmount, totalAmount: amount, taxRate, taxType };
    }
  }
}
