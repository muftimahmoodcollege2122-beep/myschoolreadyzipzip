import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
export declare class GradesController {
    private readonly svc;
    constructor(svc: GradesService);
    create(dto: CreateGradeDto, tid: string, u: any): Promise<any>;
    studentGrades(studentId: string, academicYear: string, term: string, tid: string): Promise<any>;
    reportCard(studentId: string, academicYear: string, term: string, tid: string): Promise<import("./grades.service").ReportCardData>;
    gradebook(sectionId: string, classSubjectId: string, term: string, academicYear: string, tid: string): Promise<any>;
}
