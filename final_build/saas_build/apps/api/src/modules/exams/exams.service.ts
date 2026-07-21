/**
 * Exams service — examination scheduling and result management.
 * createExam(): schedules an exam for a class/subject
 * getUpcomingExams(): exams in the next 30 days
 * publishResults(): makes results visible to students/parents
 * generateHallTicket(): PDF hall ticket for a student
 */

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ExamsService {
  private readonly logger = new Logger(ExamsService.name);
  constructor(private prisma: PrismaService) {}

  async create(dto: any, tenantId: string, createdById: string) {
    let schoolId = dto.schoolId;
    if (!schoolId) {
      const school = await this.prisma.school.findFirst({ where: { tenantId }, orderBy: { createdAt: 'asc' } });
      if (!school) throw new NotFoundException('School not found for this tenant');
      schoolId = school.id;
    }
    return this.prisma.$transaction!(async tx => {
      const exam = await tx.exam.create({
        data: {
          tenantId,
          schoolId,
          subjectId: dto.subjectId,
          name: dto.name || dto.title,
          examType: dto.examType || 'MIDTERM',
          academicYear: dto.academicYear || new Date().getFullYear().toString(),
          term: dto.term || 'Term 1',
          scheduledAt: new Date(dto.scheduledAt || dto.startDate || Date.now()),
          duration: dto.duration || 60,
          maxMarks: dto.maxMarks || 100,
          passingMarks: dto.passingMarks || dto.passMarks || Math.floor((dto.maxMarks || 100) * 0.4),
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
      where: { tenantId, ...(academicYear && { academicYear }) },
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
    return this.prisma.$transaction!(async tx => {
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
