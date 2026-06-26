import { ReportsService } from './reports.service';
import { Response } from 'express';
export declare class ReportsController {
    private readonly svc;
    constructor(svc: ReportsService);
    queueReportCard(dto: {
        studentId: string;
        academicYear: string;
        term: string;
    }, tid: string, u: any): Promise<{
        success: boolean;
        jobId: string;
        message: string;
    }>;
    bulkReportCards(dto: {
        academicYear: string;
        term: string;
        schoolId?: string;
    }, tid: string, u: any): Promise<{
        success: boolean;
        jobId: string;
        message: string;
    }>;
    reportCardPdf(studentId: string, academicYear: string, term: string, tid: string): Promise<{
        success: boolean;
        s3Key: string;
    }>;
    exportStudents(schoolId: string, tid: string, res: Response): Promise<void>;
    attendanceCsv(sectionId: string, from: string, to: string, tid: string, res: Response): Promise<void>;
}
