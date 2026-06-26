import { RealtimeGateway } from './realtime.gateway';
import { PrismaService } from '../database/prisma.service';
export interface AttendanceEvent {
    studentId: string;
    studentName: string;
    rollNumber: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    sectionId: string;
    date: string;
    markedByName: string;
}
export interface FeePaymentEvent {
    invoiceId: string;
    studentId: string;
    studentName: string;
    amount: number;
    paymentMethod: string;
    receiptNumber: string;
}
export interface ExamResultEvent {
    examId: string;
    examTitle: string;
    sectionId: string;
    publishedCount: number;
}
export interface DashboardStatsEvent {
    totalStudents?: number;
    presentToday?: number;
    absentToday?: number;
    attendanceRate?: number;
    feesCollectedToday?: number;
    pendingFees?: number;
}
export declare class RealtimeService {
    private readonly gateway;
    private readonly prisma;
    private readonly logger;
    constructor(gateway: RealtimeGateway, prisma: PrismaService);
    onAttendanceMarked(tenantId: string, events: AttendanceEvent[]): Promise<void>;
    onFeePaymentRecorded(tenantId: string, event: FeePaymentEvent): Promise<void>;
    onExamResultsPublished(tenantId: string, event: ExamResultEvent): Promise<void>;
    onNotificationCreated(userId: string, tenantId: string, notification: {
        id: string;
        title: string;
        body: string;
        type: string;
        data?: any;
    }): Promise<void>;
    broadcastDashboardUpdate(tenantId: string, stats: DashboardStatsEvent): void;
    broadcastAnnouncement(tenantId: string, announcement: {
        id: string;
        title: string;
        body: string;
        priority: 'normal' | 'urgent';
        targetRoles?: string[];
    }): void;
    getOnlineCount(tenantId: string): number;
}
