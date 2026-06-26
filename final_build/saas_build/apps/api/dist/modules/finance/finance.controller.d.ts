import { FinanceService } from './finance.service';
export declare class FinanceController {
    private readonly svc;
    constructor(svc: FinanceService);
    createExpense(dto: any, tid: string, u: any): Promise<any>;
    listExpenses(tid: string, sid?: string, cat?: string, from?: string, to?: string, status?: string): Promise<any>;
    approveExpense(id: string, tid: string, u: any): Promise<any>;
    rejectExpense(id: string, tid: string): Promise<any>;
    getExpenseSummary(tid: string, sid: string, period: string): Promise<{
        total: any;
        byCategory: any;
        count: any;
        period: string;
    }>;
    setBudget(dto: any, tid: string, u: any): Promise<any>;
    listBudgets(tid: string, sid: string, period?: string): Promise<any>;
    getBudgetAnalysis(tid: string, sid: string, period: string): Promise<{
        budgets: any;
        totalAllocated: any;
        totalSpent: any;
        remaining: number;
        utilizationRate: number;
    }>;
    addCashbookEntry(dto: any, tid: string, u: any): Promise<any>;
    getCashbook(tid: string, sid: string, from: string, to: string): Promise<{
        entries: any;
        income: any;
        expense: any;
        balance: number;
        period: {
            from: string;
            to: string;
        };
    }>;
    getDashboard(tid: string, sid: string): Promise<{
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
    getIncomeVsExpense(tid: string, sid: string, year: string): Promise<{
        month: string;
        income: number;
        expense: number;
    }[]>;
    calculateTax(dto: any): Promise<{
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
