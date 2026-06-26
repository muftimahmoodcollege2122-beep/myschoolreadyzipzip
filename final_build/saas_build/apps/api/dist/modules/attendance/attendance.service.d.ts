import { PrismaService } from '../../database/prisma.service';
import { EventPublisher } from '../../events/event-publisher.service';
import { AuditService } from '../../common/audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceReportQueryDto } from './dto/attendance-report-query.dto';
export interface AttendanceSummary {
    studentId: string;
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
}
export declare class AttendanceService {
    private readonly prisma;
    private readonly events;
    private readonly audit;
    private readonly notifications;
    private readonly logger;
    constructor(prisma: PrismaService, events: EventPublisher, audit: AuditService, notifications: NotificationsService);
    markSectionAttendance(sectionId: string, tenantId: string, teacherId: string, records: MarkAttendanceDto[]): Promise<{
        marked: number;
        absentCount: number;
        lateCount: number;
    }>;
    getStudentAttendance(studentId: string, tenantId: string, startDate: Date, endDate: Date): Promise<{
        records: any;
        summary: AttendanceSummary;
    }>;
    getSectionAttendanceReport(sectionId: string, tenantId: string, query: AttendanceReportQueryDto): Promise<{
        sectionId: string;
        startDate: string;
        endDate: string;
        report: any;
        totalStudents: any;
    }>;
    getTodayAttendanceSummary(tenantId: string, schoolId?: string): Promise<{
        date: Date;
        total: any;
        present: any;
        absent: any;
        late: any;
        excused: any;
        presentRate: number;
    }>;
    getChronicAbsentees(schoolId: string, tenantId: string, threshold: number | undefined, academicYear: string): Promise<any>;
    private calculateSummary;
}
