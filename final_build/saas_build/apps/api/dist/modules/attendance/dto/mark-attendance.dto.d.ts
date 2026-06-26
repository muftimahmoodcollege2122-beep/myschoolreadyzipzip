import { AttendanceStatus } from '../../../common/prisma-enums';
export declare class MarkAttendanceDto {
    studentId: string;
    status: AttendanceStatus;
    remarks?: string;
}
