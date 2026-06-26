import { Gender } from '@prisma/client';
export declare class UpdateStudentDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    gender?: Gender;
    bloodGroup?: string;
    medicalNotes?: string;
    transportId?: string;
    hostelId?: string;
}
export declare class StudentListQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    classId?: string;
    sectionId?: string;
    isActive?: boolean;
}
