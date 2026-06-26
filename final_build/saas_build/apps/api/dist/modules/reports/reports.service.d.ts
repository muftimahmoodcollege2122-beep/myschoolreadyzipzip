import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { PrismaService } from '../../database/prisma.service';
import { S3StorageService } from '../../common/storage/s3-storage.service';
import { GradesService } from '../grades/grades.service';
import { AttendanceService } from '../attendance/attendance.service';
export interface ReportJob {
    type: 'report_card' | 'attendance_report' | 'fee_report' | 'custom';
    tenantId: string;
    parameters: Record<string, unknown>;
    requestedById: string;
    notifyEmail?: string;
}
export declare class ReportsService {
    private readonly prisma;
    private readonly config;
    private readonly storage;
    private readonly gradesService;
    private readonly attendanceService;
    private readonly reportsQueue;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService, storage: S3StorageService, gradesService: GradesService, attendanceService: AttendanceService, reportsQueue: Queue);
    queueReport(job: ReportJob): Promise<string>;
    generateReportCardPdf(studentId: string, tenantId: string, academicYear: string, term: string): Promise<string>;
    exportStudentsToExcel(tenantId: string, schoolId: string, filters: Record<string, unknown>): Promise<Buffer>;
    exportAttendanceCsv(tenantId: string, sectionId: string, startDate: Date, endDate: Date): Promise<string>;
    private htmlToPdf;
    private buildReportCardHtml;
}
