import { PrismaService } from '../../database/prisma.service';
export declare class LibraryService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private resolveSchoolId;
    listBooks(tenantId: string, schoolId: string, page?: number, limit?: number, search?: string, category?: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    createBook(tenantId: string, schoolId: string, dto: any): Promise<any>;
    updateBook(tenantId: string, id: string, dto: any): Promise<any>;
    deleteBook(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    issueBook(tenantId: string, bookId: string, userId: string, dueDays?: number): Promise<any>;
    returnBook(tenantId: string, issueId: string): Promise<{
        success: boolean;
        overdueDays: number;
        fineAmount: number;
    }>;
    listIssues(tenantId: string, returned?: boolean, page?: number, limit?: number): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getCategories(tenantId: string): Promise<any>;
    getStats(tenantId: string): Promise<{
        totalBooks: any;
        availableCopies: any;
        totalIssued: any;
        overdue: any;
    }>;
}
