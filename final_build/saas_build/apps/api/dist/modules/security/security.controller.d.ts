import { SecurityService } from './security.service';
export declare class SecurityController {
    private readonly svc;
    constructor(svc: SecurityService);
    setupMfa(u: any): Promise<{
        secret: string;
        qrCodeUrl: string;
        backupCodes: string[];
    }>;
    enableMfa(dto: any, u: any): Promise<{
        enabled: boolean;
    }>;
    disableMfa(dto: any, u: any): Promise<{
        disabled: boolean;
    }>;
    verifyMfa(dto: any, u: any): Promise<{
        valid: boolean;
    }>;
    addIpRestriction(dto: any, tid: string, u: any): Promise<any>;
    listIpRestrictions(tid: string, type?: string): Promise<any>;
    removeIpRestriction(id: string, tid: string): Promise<any>;
    getLoginHistory(tid: string, u: any, limit?: string): Promise<any>;
    getTenantLoginStats(tid: string): Promise<{
        totalSuccessful: any;
        failedLast24h: any;
        todayLogins: any;
    }>;
    getSuspiciousActivities(tid: string, resolved?: string): Promise<any>;
    resolveSuspicious(id: string, tid: string, u: any): Promise<any>;
    getDashboard(tid: string): Promise<{
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
    getAuditLogs(tid: string, entity?: string, uid?: string, page?: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getComplianceReport(tid: string): Promise<{
        emailVerificationRate: any;
        consentRecords: any;
        auditLogsLast30Days: any;
        gdprCompliant: boolean;
        dataRetentionPolicy: string;
        encryptionAtRest: boolean;
        encryptionInTransit: boolean;
    }>;
}
