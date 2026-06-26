import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { Queue } from 'bull';
import { CreateGradeDto } from './dto/create-grade.dto';
import { ExamType } from '@prisma/client';
export interface SubjectGradeSummary {
    subjectId: string;
    subjectName: string;
    assessments: Array<{
        type: ExamType;
        title: string;
        score: number;
        maxScore: number;
        weight: number;
    }>;
    weightedAverage: number;
    letterGrade: string;
    gpa: number;
}
export interface ReportCardData {
    student: {
        id: string;
        rollNumber: string;
        admissionNo: string;
    };
    academicYear: string;
    term: string;
    subjects: SubjectGradeSummary[];
    overallGpa: number;
    overallPercentage: number;
}
export declare class GradesService {
    private readonly prisma;
    private readonly audit;
    private readonly reportsQueue;
    private readonly logger;
    constructor(prisma: PrismaService, audit: AuditService, reportsQueue: Queue);
    createGrade(dto: CreateGradeDto, tenantId: string, teacherId: string): Promise<any>;
    getStudentGrades(studentId: string, tenantId: string, academicYear: string, term?: string): Promise<any>;
    getStudentReportCard(studentId: string, tenantId: string, academicYear: string, term: string): Promise<ReportCardData>;
    getSectionGradebook(sectionId: string, classSubjectId: string, tenantId: string, term: string, academicYear: string): Promise<any>;
    queueReportCardGeneration(studentIds: string[], tenantId: string, academicYear: string, term: string, requestedById: string): Promise<string>;
    private getLetterGrade;
}
