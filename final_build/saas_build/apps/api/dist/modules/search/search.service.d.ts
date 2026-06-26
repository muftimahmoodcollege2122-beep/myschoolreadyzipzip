import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
export declare class SearchService {
    private prisma;
    private cache;
    private readonly logger;
    constructor(prisma: PrismaService, cache: CacheService);
    globalSearch(query: string, tenantId: string, limit?: number): Promise<any>;
    studentSearch(query: string, tenantId: string, filters?: any): Promise<{
        data: any;
        total: any;
    }>;
    getAttendanceAnalytics(tenantId: string, schoolId: string, from: string, to: string): Promise<any>;
    getFeeAnalytics(tenantId: string, schoolId: string, year: number): Promise<any>;
    getEnrollmentTrend(tenantId: string, schoolId: string): Promise<any>;
    getExamPerformanceAnalytics(tenantId: string, sectionId: string, academicYear: string): Promise<any>;
    getPlatformAnalytics(): Promise<{
        tenantGrowth: any;
        planDistribution: any;
        activeToday: any;
        topSchools: any;
    }>;
}
