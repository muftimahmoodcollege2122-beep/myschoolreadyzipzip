import { AiAnalyticsService } from './ai-analytics.service';
export declare class AiAnalyticsController {
    private readonly svc;
    constructor(svc: AiAnalyticsService);
    getDropoutRisk(tid: string, sid?: string): Promise<any>;
    getPerformancePrediction(sid: string, tid: string): Promise<{
        studentId: string;
        currentAvgGrade: number;
        attendanceRate: number;
        trend: string;
        predictedNextGrade: number;
        confidence: number;
        recentExams: any;
    }>;
    getAttendanceAnalytics(tid: string, sid?: string): Promise<{
        overallRate: number;
        byStatus: any;
        dailyTrend: any;
        totalRecords: any;
    }>;
    getFeeAnalytics(tid: string): Promise<{
        collectionRate: number;
        totalBilled: any;
        totalCollected: number;
        outstanding: number;
        byStatus: any;
        monthlyRevenue: any;
        overdueTrend: any;
    }>;
    getSchoolPerformance(tid: string): Promise<{
        students: any;
        teachers: any;
        attendanceRate: number;
        feeCollectionRate: number;
        exams: any;
        kpis: {
            engagement: number;
            financial: number;
            academic: number;
            overall: number;
        };
    }>;
    getBenchmarking(tid: string): Promise<{
        school: {
            students: any;
            attendanceRate: number;
            feeCollectionRate: number;
        };
        industry: {
            attendanceRate: number;
            feeCollectionRate: number;
            studentTeacherRatio: number;
        };
        ranking: string;
        suggestions: string[];
    }>;
    generateReport(dto: any, tid: string): Promise<{
        type: string;
        generatedAt: Date;
        data: any;
        insights: string[];
        recommendations: string[];
    }>;
}
