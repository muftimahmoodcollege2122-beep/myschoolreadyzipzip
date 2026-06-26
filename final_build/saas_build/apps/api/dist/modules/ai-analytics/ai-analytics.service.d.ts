import { PrismaService } from '../../database/prisma.service';
export declare class AiAnalyticsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getDropoutRiskStudents(tenantId: string, schoolId?: string): Promise<any>;
    getPerformancePrediction(tenantId: string, studentId: string): Promise<{
        studentId: string;
        currentAvgGrade: number;
        attendanceRate: number;
        trend: string;
        predictedNextGrade: number;
        confidence: number;
        recentExams: any;
    }>;
    getAttendanceAnalytics(tenantId: string, schoolId?: string): Promise<{
        overallRate: number;
        byStatus: any;
        dailyTrend: any;
        totalRecords: any;
    }>;
    getFeeAnalytics(tenantId: string): Promise<{
        collectionRate: number;
        totalBilled: any;
        totalCollected: number;
        outstanding: number;
        byStatus: any;
        monthlyRevenue: any;
        overdueTrend: any;
    }>;
    getSchoolPerformanceDashboard(tenantId: string): Promise<{
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
    getBenchmarkingData(tenantId: string): Promise<{
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
    generateAiReport(type: string, tenantId: string, params: any): Promise<{
        type: string;
        generatedAt: Date;
        data: any;
        insights: string[];
        recommendations: string[];
    }>;
    private generateInsights;
    private generateRecommendations;
}
