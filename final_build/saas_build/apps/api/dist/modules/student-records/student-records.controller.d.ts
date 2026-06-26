import { StudentRecordsService } from './student-records.service';
export declare class StudentRecordsController {
    private readonly svc;
    constructor(svc: StudentRecordsService);
    logBehavior(dto: any, tid: string, u: any): Promise<any>;
    getBehavior(sid: string, tid: string, type?: string): Promise<any>;
    resolveBehavior(id: string, tid: string, u: any): Promise<any>;
    getBehaviorStats(tid: string, sid?: string): Promise<{
        positives: any;
        negatives: any;
        critical: any;
        total: any;
    }>;
    upsertMedical(sid: string, dto: any, tid: string, u: any): Promise<any>;
    getMedical(sid: string, tid: string): Promise<any>;
    addAchievement(dto: any, tid: string, u: any): Promise<any>;
    getAchievements(sid: string, tid: string): Promise<any>;
    deleteAchievement(id: string, tid: string): Promise<any>;
    issueWarning(dto: any, tid: string, u: any): Promise<any>;
    getWarnings(sid: string, tid: string, active?: string): Promise<any>;
    resolveWarning(id: string, tid: string, u: any): Promise<any>;
    getDisciplinarySummary(sid: string, tid: string): Promise<{
        behaviors: any;
        warnings: any;
        achievements: any;
        riskLevel: string;
    }>;
}
