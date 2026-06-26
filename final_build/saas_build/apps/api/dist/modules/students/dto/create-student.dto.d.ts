import { Gender } from '../../../common/prisma-enums';
export declare class CreateStudentDto {
    firstName: string;
    lastName: string;
    email: string;
    admissionNo: string;
    rollNumber: string;
    admissionDate: string;
    dateOfBirth?: string;
    gender?: Gender;
    phone?: string;
    bloodGroup?: string;
    sectionId?: string;
    academicYear: string;
    transportId?: string;
    hostelId?: string;
}
