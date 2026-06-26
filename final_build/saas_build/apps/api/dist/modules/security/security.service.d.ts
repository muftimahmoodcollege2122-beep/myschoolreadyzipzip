import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
export declare class SecurityService {
    private readonly prisma;
    private readonly audit;
    private readonly logger;
    constructor(prisma: PrismaService, audit: AuditService);
    generateMfaSecret(userId: string): Promise<{
        secret: string;
        qrCodeUrl: string;
        backupCodes: string[];
    }>;
    enableMfa(userId: string, token: string): Promise<{
        enabled: boolean;
    }>;
    disableMfa(userId: string, token: string): Promise<{
        disabled: boolean;
    }>;
    verifyMfaToken(userId: string, token: string): Promise<{
        valid: boolean;
    }>;
    addIpRestriction(dto: any, tenantId: string, createdById: string): Promise<any>;
    listIpRestrictions(tenantId: string, type?: string): Promise<any>;
    removeIpRestriction(id: string, tenantId: string): Promise<any>;
    checkIpAccess(ip: string, tenantId: string): Promise<{
        allowed: boolean;
        reason?: string;
    }>;
    logLogin(userId: string, tenantId: string, ip: string, userAgent: string, status: string, failReason?: string): Promise<any>;
    getLoginHistory(userId: string, tenantId: string, limit?: number): Promise<any>;
    getTenantLoginStats(tenantId: string): Promise<{
        totalSuccessful: any;
        failedLast24h: any;
        todayLogins: any;
    }>;
    flagSuspiciousActivity(dto: any, tenantId: string): Promise<any>;
    getSuspiciousActivities(tenantId: string, resolved?: boolean): Promise<any>;
    resolveSuspiciousActivity(id: string, tenantId: string, resolvedById: string): Promise<any>;
    getSecurityDashboard(tenantId: string): Promise<{
        mfaAdoption: number;
        mfaEnabledCount: any;
        totalUsers: any;
        loginStats: {
            totalSuccessful: any;
            failedLast24h: any;
            todayLogins: any;
        };
        unresolvedSuspiciousActivities: any;
        recentAuditLogs: any;
    }>;
    getAuditLogs(tenantId: string, entity?: string, userId?: string, page?: number, limit?: number): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    maskPii(text: string): Promise<string>;
    getComplianceReport(tenantId: string): Promise<{
        emailVerificationRate: any;
        consentRecords: any;
        auditLogsLast30Days: any;
        gdprCompliant: boolean;
        dataRetentionPolicy: string;
        encryptionAtRest: boolean;
        encryptionInTransit: boolean;
    }>;
}
