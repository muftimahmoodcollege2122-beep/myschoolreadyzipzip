/**
 * Grades service — exam results, report cards, and academic performance.
 * submitGrade(): teacher submits marks for a student in a subject
 * getGradebook(): full class gradebook with all subjects
 * generateReportCard(): creates per-student academic report
 * getClassRanking(): sorts students by total marks
 * calculateGPA(): converts marks to GPA based on grading scale
 */

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CreateGradeDto } from './dto/create-grade.dto';
import { ExamType } from '../../common/prisma-enums';

export interface SubjectGradeSummary {
  subjectId: string;
  subjectName: string;
  assessments: Array<{ type: ExamType; title: string; score: number; maxScore: number; weight: number }>;
  weightedAverage: number;
  letterGrade: string;
  gpa: number;
}

export interface ReportCardData {
  student: { id: string; rollNumber: string; admissionNo: string };
  academicYear: string;
  term: string;
  subjects: SubjectGradeSummary[];
  overallGpa: number;
  overallPercentage: number;
}

const GRADING_SCALE = [
  { grade: 'A+', min: 95, gpa: 4.0 }, { grade: 'A',  min: 90, gpa: 4.0 },
  { grade: 'A-', min: 85, gpa: 3.7 }, { grade: 'B+', min: 80, gpa: 3.3 },
  { grade: 'B',  min: 75, gpa: 3.0 }, { grade: 'B-', min: 70, gpa: 2.7 },
  { grade: 'C+', min: 65, gpa: 2.3 }, { grade: 'C',  min: 60, gpa: 2.0 },
  { grade: 'D',  min: 50, gpa: 1.0 }, { grade: 'F',  min: 0,  gpa: 0.0 },
];

@Injectable()
export class GradesService {
  private readonly logger = new Logger(GradesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @InjectQueue('reports') private readonly reportsQueue: Queue,
  ) {}

  async createGrade(dto: CreateGradeDto, tenantId: string, teacherId: string): Promise<any> {
    const classSubject = await this.prisma.classSubject.findFirst({
      where: { id: dto.classSubjectId, teacherId, tenantId },
    });
    if (!classSubject) throw new BadRequestException('Not assigned to this class-subject');

    const grade = await this.prisma.grade.create({
      data: {
        studentId:     dto.studentId,
        classSubjectId: dto.classSubjectId,
        teacherId,
        tenantId,
        academicYear:  dto.academicYear,
        term:          dto.term,
        assessmentType: dto.assessmentType,
        title:         dto.title,
        score:         dto.score,
        maxScore:      dto.maxScore,
        weight:        dto.weight ?? 1.0,
        remarks:       dto.remarks,
      },
    });

    await this.audit.log({
      tenantId, userId: teacherId, action: 'CREATE', entity: 'Grade', entityId: grade.id,
      after: { studentId: dto.studentId, score: dto.score, maxScore: dto.maxScore },
    });
    return grade;
  }

  async getStudentGrades(studentId: string, tenantId: string, academicYear: string, term?: string) {
    return this.prisma.grade.findMany({
      where: { studentId, tenantId, academicYear, ...(term && { term }) },
      include: { classSubject: { include: { subject: true } } },
      orderBy: [{ term: 'asc' }, { gradedAt: 'asc' }],
    });
  }

  async getStudentReportCard(
    studentId: string,
    tenantId: string,
    academicYear: string,
    term: string,
  ): Promise<ReportCardData> {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
    });
    if (!student) throw new NotFoundException('Student not found');

    const grades = await this.prisma.grade.findMany({
      where: { studentId, tenantId, academicYear, term },
      include: { classSubject: { include: { subject: true } } },
    });

    const subjectMap = new Map<string, typeof grades>();
    for (const g of grades) {
      const sid = g.classSubject.subjectId;
      if (!subjectMap.has(sid)) subjectMap.set(sid, []);
      subjectMap.get(sid)!.push(g);
    }

    const subjects: SubjectGradeSummary[] = [];
    for (const [subjectId, sg] of subjectMap) {
      const subject = sg[0].classSubject.subject;
      const totalWeight = sg.reduce((s, g) => s + Number(g.weight), 0);
      const weightedSum = sg.reduce((s, g) => s + (Number(g.score) / Number(g.maxScore)) * 100 * Number(g.weight), 0);
      const avg = totalWeight > 0 ? weightedSum / totalWeight : 0;
      const { grade: letterGrade, gpa } = this.getLetterGrade(avg);
      subjects.push({
        subjectId, subjectName: subject.name,
        assessments: sg.map(g => ({ type: g.assessmentType, title: g.title, score: Number(g.score), maxScore: Number(g.maxScore), weight: Number(g.weight) })),
        weightedAverage: Math.round(avg * 100) / 100,
        letterGrade, gpa,
      });
    }

    const overallGpa = subjects.length > 0 ? subjects.reduce((s, sub) => s + sub.gpa, 0) / subjects.length : 0;
    const overallPercentage = subjects.length > 0 ? subjects.reduce((s, sub) => s + sub.weightedAverage, 0) / subjects.length : 0;

    return { student: { id: student.id, rollNumber: student.rollNumber, admissionNo: student.admissionNo }, academicYear, term, subjects, overallGpa: Math.round(overallGpa * 100) / 100, overallPercentage: Math.round(overallPercentage * 100) / 100 };
  }

  async getSectionGradebook(sectionId: string, classSubjectId: string, tenantId: string, term: string, academicYear: string) {
    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: { sectionId, tenantId, isActive: true },
      include: {
        student: {
          include: {
            user: { include: { profile: true } },
            grades: { where: { classSubjectId, tenantId, term, academicYear }, orderBy: { gradedAt: 'asc' } },
          },
        },
      },
    });
    return enrollments.map(e => {
      const grds = e.student.grades;
      const tw = grds.reduce((s, g) => s + Number(g.weight), 0);
      const ws = grds.reduce((s, g) => s + (Number(g.score) / Number(g.maxScore)) * 100 * Number(g.weight), 0);
      const avg = tw > 0 ? ws / tw : null;
      return {
        studentId: e.studentId,
        rollNumber: e.student.rollNumber,
        name: `${e.student.user.profile?.firstName ?? ''} ${e.student.user.profile?.lastName ?? ''}`.trim(),
        grades: grds,
        average: avg !== null ? Math.round(avg * 100) / 100 : null,
        letterGrade: avg !== null ? this.getLetterGrade(avg).grade : null,
      };
    });
  }

  async queueReportCardGeneration(studentIds: string[], tenantId: string, academicYear: string, term: string, requestedById: string): Promise<string> {
    const job = await this.reportsQueue.add('generate-report-cards', { studentIds, tenantId, academicYear, term, requestedById }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });
    return String(job.id);
  }

  private getLetterGrade(percentage: number): { grade: string; gpa: number } {
    for (const scale of GRADING_SCALE) {
      if (percentage >= scale.min) return { grade: scale.grade, gpa: scale.gpa };
    }
    return { grade: 'F', gpa: 0.0 };
  }
}
