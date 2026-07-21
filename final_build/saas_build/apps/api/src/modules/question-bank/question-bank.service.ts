import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class QuestionBankService {
  private readonly logger = new Logger(QuestionBankService.name);
  constructor(private readonly prisma: PrismaService) {}

  async createBank(dto: any, tenantId: string, createdById: string) {
    return this.prisma.questionBank.create({
      data: { tenantId, schoolId: dto.schoolId, subjectId: dto.subjectId, name: dto.name, description: dto.description, createdById },
    });
  }

  async listBanks(tenantId: string, schoolId?: string, subjectId?: string) {
    return this.prisma.questionBank.findMany({
      where: { tenantId, ...(schoolId && { schoolId }), ...(subjectId && { subjectId }), isActive: true },
      include: { _count: { select: { questions: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createQuestion(dto: any, tenantId: string, createdById: string) {
    const bank = await this.prisma.questionBank.findFirst({ where: { id: dto.questionBankId, tenantId } });
    if (!bank) throw new NotFoundException('Question bank not found');
    return this.prisma.question.create({
      data: {
        tenantId, questionBankId: dto.questionBankId, subjectId: dto.subjectId,
        type: dto.type, text: dto.text, marks: dto.marks, difficulty: dto.difficulty ?? 'MEDIUM',
        options: dto.options, correctAnswer: dto.correctAnswer, explanation: dto.explanation,
        tags: dto.tags ?? [], createdById,
      },
    });
  }

  async listQuestions(tenantId: string, bankId?: string, type?: string, difficulty?: string, subjectId?: string, search?: string) {
    return this.prisma.question.findMany({
      where: {
        tenantId,
        ...(bankId && { questionBankId: bankId }),
        ...(type && { type: type as any }),
        ...(difficulty && { difficulty: difficulty as any }),
        ...(subjectId && { subjectId }),
        ...(search && { text: { contains: search, mode: 'insensitive' } }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateQuestion(id: string, dto: any, tenantId: string) {
    const q = await this.prisma.question.findFirst({ where: { id, tenantId } });
    if (!q) throw new NotFoundException('Question not found');
    return this.prisma.question.update({ where: { id }, data: dto });
  }

  async deleteQuestion(id: string, tenantId: string) {
    const q = await this.prisma.question.findFirst({ where: { id, tenantId } });
    if (!q) throw new NotFoundException('Question not found');
    return this.prisma.question.delete({ where: { id } });
  }

  async generatePaper(dto: { bankId: string; totalMarks: number; questionCount: number; types?: string[]; difficulty?: string }, tenantId: string) {
    const where: any = { tenantId, questionBankId: dto.bankId };
    if (dto.difficulty) where.difficulty = dto.difficulty;
    if (dto.types?.length) where.type = { in: dto.types };
    const all = await this.prisma.question.findMany({ where, orderBy: { usageCount: 'asc' } });
    if (!all.length) throw new BadRequestException('No questions found in bank with given filters');
    const shuffled = all.sort(() => Math.random() - 0.5).slice(0, dto.questionCount);
    const actualTotal = shuffled.reduce((s, q) => s + Number(q.marks), 0);
    if (shuffled.length) {
      await this.prisma.question.updateMany({ where: { id: { in: shuffled.map(q => q.id) } }, data: { usageCount: { increment: 1 } } });
    }
    return { questions: shuffled, totalMarks: actualTotal, questionCount: shuffled.length, generatedAt: new Date() };
  }

  async startOnlineExam(examId: string, studentId: string, tenantId: string, ipAddress?: string) {
    const existing = await this.prisma.onlineExamSession.findUnique({ where: { examId_studentId: { examId, studentId } } });
    if (existing) {
      if (existing.status === 'SUBMITTED' || existing.status === 'GRADED') throw new BadRequestException('Exam already submitted');
      return existing;
    }
    const exam = await this.prisma.exam.findFirst({ where: { id: examId, tenantId } });
    if (!exam) throw new NotFoundException('Exam not found');
    return this.prisma.onlineExamSession.create({
      data: { tenantId, examId, studentId, timeLimit: exam.duration, totalMarks: exam.maxMarks, ipAddress },
    });
  }

  async submitAnswer(sessionId: string, questionId: string, answer: string, tenantId: string) {
    const session = await this.prisma.onlineExamSession.findFirst({ where: { id: sessionId, tenantId, status: 'ONGOING' } });
    if (!session) throw new NotFoundException('Active exam session not found');
    const q = await this.prisma.question.findFirst({ where: { id: questionId } });
    let isCorrect: boolean | undefined;
    let marksAwarded = 0;
    if (q?.type === 'MCQ' || q?.type === 'TRUE_FALSE') {
      isCorrect = answer === q.correctAnswer;
      marksAwarded = isCorrect ? Number(q.marks) : 0;
    }
    return this.prisma.onlineExamAnswer.upsert({
      where: { sessionId_questionId: { sessionId, questionId } },
      create: { sessionId, questionId, tenantId, answer, isCorrect, marksAwarded },
      update: { answer, isCorrect, marksAwarded },
    });
  }

  async submitExam(sessionId: string, tenantId: string) {
    const session = await this.prisma.onlineExamSession.findFirst({
      where: { id: sessionId, tenantId, status: 'ONGOING' },
      include: { answers: { include: { question: true } } },
    });
    if (!session) throw new NotFoundException('Active exam session not found');
    const autoGraded = session.answers.reduce((s, a) => s + Number(a.marksAwarded ?? 0), 0);
    return this.prisma.onlineExamSession.update({
      where: { id: sessionId },
      data: { submittedAt: new Date(), status: 'SUBMITTED', obtainedMarks: autoGraded },
    });
  }

  async getSessionResults(sessionId: string, tenantId: string) {
    return this.prisma.onlineExamSession.findFirst({
      where: { id: sessionId, tenantId },
      include: { answers: { include: { question: true } } },
    });
  }

  async getBankStats(bankId: string, tenantId: string) {
    const bank = await this.prisma.questionBank.findFirst({ where: { id: bankId, tenantId } });
    if (!bank) throw new NotFoundException('Question bank not found');
    const [total, byType, byDiff] = await Promise.all([
      this.prisma.question.count({ where: { questionBankId: bankId, tenantId } }),
      this.prisma.question.groupBy({ by: ['type'], where: { questionBankId: bankId, tenantId }, _count: true }),
      this.prisma.question.groupBy({ by: ['difficulty'], where: { questionBankId: bankId, tenantId }, _count: true }),
    ]);
    return { bank, total, byType, byDiff };
  }
}
