import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
export declare class StudentRecordsService {
    private readonly prisma;
    private readonly audit;
    private readonly logger;
    constructor(prisma: PrismaService, audit: AuditService);
    logBehavior(dto: any, tenantId: string, reportedById: string): Promise<any>;
    getBehaviorHistory(studentId: string, tenantId: string, type?: string, limit?: number): Promise<any>;
    resolveBehavior(id: string, tenantId: string, userId: string): Promise<any>;
    getBehaviorStats(tenantId: string, schoolId?: string): Promise<{
        positives: any;
        negatives: any;
        critical: any;
        total: any;
    }>;
    upsertMedical(studentId: string, dto: any, tenantId: string, userId: string): Promise<any>;
    getMedical(studentId: string, tenantId: string): Promise<any>;
    addAchievement(dto: any, tenantId: string, createdById: string): Promise<any>;
    getAchievements(studentId: string, tenantId: string): Promise<any>;
    deleteAchievement(id: string, tenantId: string): Promise<any>;
    issueWarning(dto: any, tenantId: string, issuedById: string): Promise<any>;
    getWarnings(studentId: string, tenantId: string, active?: boolean): Promise<any>;
    resolveWarning(id: string, tenantId: string, resolvedById: string): Promise<any>;
    getDisciplinarySummary(studentId: string, tenantId: string): Promise<{
        behaviors: any;
        warnings: any;
        achievements: any;
        riskLevel: string;
    }>;
}
