import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ExamsService {
  private readonly logger = new Logger(ExamsService.name);
  constructor(private prisma: PrismaService) {}

  async create(dto: any, tenantId: string, createdById: string) {
    return this.prisma.$transaction(async tx => {
      const exam = await tx.exam.create({
        data: {
          tenantId,
          schoolId: dto.schoolId,
          subjectId: dto.subjectId,
          name: dto.name || dto.title,
          examType: dto.examType,
          academicYear: dto.academicYear,
          term: dto.term,
          scheduledAt: new Date(dto.scheduledAt || dto.startDate),
          duration: dto.duration || 60,
          maxMarks: dto.maxMarks,
          passingMarks: dto.passingMarks || dto.passMarks,
          venue: dto.venue,
          instructions: dto.instructions,
        },
      });
      await tx.outboxEvent.create({ data: { tenantId, topic: 'exam.created', key: exam.id, payload: { examId: exam.id }, headers: {} } });
      return exam;
    });
  }

  async findAll(tenantId: string, schoolId?: string, academicYear?: string) {
    return this.prisma.exam.findMany({
      where: { tenantId, ...(schoolId && { schoolId }), ...(academicYear && { academicYear }) },
      include: { subject: true },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const exam = await this.prisma.exam.findFirst({
      where: { id, tenantId },
      include: { results: { include: { student: { include: { user: { include: { profile: true } } } } } } },
    });
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async enterResults(examId: string, results: Array<{ studentId: string; marksObtained: number; remarks?: string }>, tenantId: string) {
    const exam = await this.prisma.exam.findFirst({ where: { id: examId, tenantId } });
    if (!exam) throw new NotFoundException('Exam not found');
    return this.prisma.$transaction(async tx => {
      for (const r of results) {
        const pct = (Number(r.marksObtained) / Number(exam.maxMarks)) * 100;
        const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F';
        await tx.examResult.upsert({
          where: { examId_studentId: { examId, studentId: r.studentId } },
          create: { examId, studentId: r.studentId, tenantId, marksObtained: r.marksObtained, grade, remarks: r.remarks },
          update: { marksObtained: r.marksObtained, grade, remarks: r.remarks },
        });
      }
      await tx.exam.update({ where: { id: examId }, data: { isPublished: true } });
      await tx.outboxEvent.create({ data: { tenantId, topic: 'exam.results_published', key: examId, payload: { examId, count: results.length }, headers: {} } });
      return { published: results.length };
    });
  }

  async getSectionResults(examId: string, tenantId: string) {
    const results = await this.prisma.examResult.findMany({
      where: { examId, tenantId },
      include: { student: { include: { user: { include: { profile: true } } } } },
      orderBy: { marksObtained: 'desc' },
    });
    return results.map((r, i) => ({ ...r, rank: i + 1 }));
  }
}
