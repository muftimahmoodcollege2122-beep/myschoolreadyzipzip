import { SearchService } from './search.service';
export declare class SearchController {
    private readonly svc;
    constructor(svc: SearchService);
    global(q: string, tid: string): Promise<any>;
    students(q: string, classId: string, sectionId: string, tid: string): Promise<{
        data: any;
        total: any;
    }>;
    attendance(sid: string, from: string, to: string, tid: string): Promise<any>;
    fees(sid: string, year: number, tid: string): Promise<any>;
    enrollment(sid: string, tid: string): Promise<any>;
    exams(sid: string, y: string, tid: string): Promise<any>;
    platform(): Promise<{
        tenantGrowth: any;
        planDistribution: any;
        activeToday: any;
        topSchools: any;
    }>;
}
