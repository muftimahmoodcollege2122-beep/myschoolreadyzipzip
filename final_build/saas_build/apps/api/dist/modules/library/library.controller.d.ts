import { LibraryService } from './library.service';
export declare class LibraryController {
    private readonly svc;
    constructor(svc: LibraryService);
    stats(tid: string): Promise<{
        totalBooks: any;
        availableCopies: any;
        totalIssued: any;
        overdue: any;
    }>;
    list(tid: string, sid: string, p: number, l: number, s: string, cat: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    categories(tid: string): Promise<any>;
    create(tid: string, sid: string, dto: any): Promise<any>;
    update(tid: string, id: string, dto: any): Promise<any>;
    remove(tid: string, id: string): Promise<{
        success: boolean;
    }>;
    issue(tid: string, bookId: string, dto: any): Promise<any>;
    returnBook(tid: string, issueId: string): Promise<{
        success: boolean;
        overdueDays: number;
        fineAmount: number;
    }>;
    issues(tid: string, returned: string, p: number, l: number): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
