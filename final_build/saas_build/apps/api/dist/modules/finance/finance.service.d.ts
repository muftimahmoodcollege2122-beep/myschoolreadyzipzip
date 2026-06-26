import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
export declare class FinanceService {
    private readonly prisma;
    private readonly audit;
    private readonly logger;
    constructor(prisma: PrismaService, audit: AuditService);
    createExpense(dto: any, tenantId: string, createdById: string): Promise<any>;
    listExpenses(tenantId: string, schoolId?: string, category?: string, from?: string, to?: string, status?: string): Promise<any>;
    approveExpense(id: string, tenantId: string, approvedById: string): Promise<any>;
    rejectExpense(id: string, tenantId: string): Promise<any>;
    getExpenseSummary(tenantId: string, schoolId: string, period: string): Promise<{
        total: any;
        byCategory: any;
        count: any;
        period: string;
    }>;
    setBudget(dto: any, tenantId: string, createdById: string): Promise<any>;
    listBudgets(tenantId: string, schoolId: string, period?: string): Promise<any>;
    getBudgetAnalysis(tenantId: string, schoolId: string, period: string): Promise<{
        budgets: any;
        totalAllocated: any;
        totalSpent: any;
        remaining: number;
        utilizationRate: number;
    }>;
    addCashbookEntry(dto: any, tenantId: string, createdById: string): Promise<any>;
    getCashbook(tenantId: string, schoolId: string, from: string, to: string): Promise<{
        entries: any;
        income: any;
        expense: any;
        balance: number;
        period: {
            from: string;
            to: string;
        };
    }>;
    getFinancialDashboard(tenantId: string, schoolId: string): Promise<{
        expenses: {
            total: any;
            byCategory: any;
            count: any;
            period: string;
        };
        budgets: any;
        cashbook: {
            entries: any;
            income: any;
            expense: any;
            balance: number;
            period: {
                from: string;
                to: string;
            };
        };
        fees: {
            total: any;
            collected: any;
            outstanding: number;
        };
    }>;
    getIncomeVsExpense(tenantId: string, schoolId: string, year: string): Promise<{
        month: string;
        income: number;
        expense: number;
    }[]>;
    calculateTax(amount: number, taxRate: number, taxType?: 'INCLUSIVE' | 'EXCLUSIVE'): Promise<{
        baseAmount: number;
        taxAmount: number;
        totalAmount: number;
        taxRate: number;
        taxType: "EXCLUSIVE";
    } | {
        baseAmount: number;
        taxAmount: number;
        totalAmount: number;
        taxRate: number;
        taxType: "INCLUSIVE";
    }>;
}
