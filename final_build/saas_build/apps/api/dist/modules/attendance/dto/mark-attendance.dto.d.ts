import { AttendanceStatus } from '@prisma/client';
export declare class MarkAttendanceDto {
    studentId: string;
    status: AttendanceStatus;
    remarks?: string;
}
