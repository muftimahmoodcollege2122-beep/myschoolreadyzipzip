import { ExamType } from '../../../common/prisma-enums';
export declare class CreateGradeDto {
    studentId: string;
    classSubjectId: string;
    academicYear: string;
    term: string;
    assessmentType: ExamType;
    title: string;
    score: number;
    maxScore: number;
    weight?: number;
    remarks?: string;
}
