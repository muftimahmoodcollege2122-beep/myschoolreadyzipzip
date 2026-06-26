import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
export declare class AttendanceController {
    private readonly svc;
    constructor(svc: AttendanceService);
    markSection(sectionId: string, records: MarkAttendanceDto[], tid: string, u: any): Promise<{
        marked: number;
        absentCount: number;
        lateCount: number;
    }>;
    sectionReport(sectionId: string, startDate: string, endDate: string, tid: string): Promise<{
        sectionId: string;
        startDate: string;
        endDate: string;
        report: any;
        totalStudents: any;
    }>;
    studentAttendance(studentId: string, startDate: string, endDate: string, tid: string): Promise<{
        records: any;
        summary: import("./attendance.service").AttendanceSummary;
    }>;
    todaySummary(tid: string, schoolId?: string): Promise<{
        date: Date;
        total: any;
        present: any;
        absent: any;
        late: any;
        excused: any;
        presentRate: number;
    }>;
    chronicAbsentees(schoolId: string, threshold: number, academicYear: string, tid: string): Promise<any>;
}
