"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var QuestionBankService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionBankService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let QuestionBankService = QuestionBankService_1 = class QuestionBankService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(QuestionBankService_1.name);
    }
    async createBank(dto, tenantId, createdById) {
        return this.prisma.questionBank.create({
            data: { tenantId, schoolId: dto.schoolId, subjectId: dto.subjectId, name: dto.name, description: dto.description, createdById },
        });
    }
    async listBanks(tenantId, schoolId, subjectId) {
        return this.prisma.questionBank.findMany({
            where: { tenantId, ...(schoolId && { schoolId }), ...(subjectId && { subjectId }), isActive: true },
            include: { _count: { select: { questions: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createQuestion(dto, tenantId, createdById) {
        const bank = await this.prisma.questionBank.findFirst({ where: { id: dto.questionBankId, tenantId } });
        if (!bank)
            throw new common_1.NotFoundException('Question bank not found');
        return this.prisma.question.create({
            data: {
                tenantId, questionBankId: dto.questionBankId, subjectId: dto.subjectId,
                type: dto.type, text: dto.text, marks: dto.marks, difficulty: dto.difficulty ?? 'MEDIUM',
                options: dto.options, correctAnswer: dto.correctAnswer, explanation: dto.explanation,
                tags: dto.tags ?? [], createdById,
            },
        });
    }
    async listQuestions(tenantId, bankId, type, difficulty, subjectId, search) {
        return this.prisma.question.findMany({
            where: {
                tenantId,
                ...(bankId && { questionBankId: bankId }),
                ...(type && { type: type }),
                ...(difficulty && { difficulty: difficulty }),
                ...(subjectId && { subjectId }),
                ...(search && { text: { contains: search, mode: 'insensitive' } }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateQuestion(id, dto, tenantId) {
        const q = await this.prisma.question.findFirst({ where: { id, tenantId } });
        if (!q)
            throw new common_1.NotFoundException('Question not found');
        return this.prisma.question.update({ where: { id }, data: dto });
    }
    async deleteQuestion(id, tenantId) {
        const q = await this.prisma.question.findFirst({ where: { id, tenantId } });
        if (!q)
            throw new common_1.NotFoundException('Question not found');
        return this.prisma.question.delete({ where: { id } });
    }
    async generatePaper(dto, tenantId) {
        const where = { tenantId, questionBankId: dto.bankId };
        if (dto.difficulty)
            where.difficulty = dto.difficulty;
        if (dto.types?.length)
            where.type = { in: dto.types };
        const all = await this.prisma.question.findMany({ where, orderBy: { usageCount: 'asc' } });
        if (!all.length)
            throw new common_1.BadRequestException('No questions found in bank with given filters');
        const shuffled = all.sort(() => Math.random() - 0.5).slice(0, dto.questionCount);
        const actualTotal = shuffled.reduce((s, q) => s + Number(q.marks), 0);
        if (shuffled.length) {
            await this.prisma.question.updateMany({ where: { id: { in: shuffled.map(q => q.id) } }, data: { usageCount: { increment: 1 } } });
        }
        return { questions: shuffled, totalMarks: actualTotal, questionCount: shuffled.length, generatedAt: new Date() };
    }
    async startOnlineExam(examId, studentId, tenantId, ipAddress) {
        const existing = await this.prisma.onlineExamSession.findUnique({ where: { examId_studentId: { examId, studentId } } });
        if (existing) {
            if (existing.status === 'SUBMITTED' || existing.status === 'GRADED')
                throw new common_1.BadRequestException('Exam already submitted');
            return existing;
        }
        const exam = await this.prisma.exam.findFirst({ where: { id: examId, tenantId } });
        if (!exam)
            throw new common_1.NotFoundException('Exam not found');
        return this.prisma.onlineExamSession.create({
            data: { tenantId, examId, studentId, timeLimit: exam.duration, totalMarks: exam.maxMarks, ipAddress },
        });
    }
    async submitAnswer(sessionId, questionId, answer, tenantId) {
        const session = await this.prisma.onlineExamSession.findFirst({ where: { id: sessionId, tenantId, status: 'ONGOING' } });
        if (!session)
            throw new common_1.NotFoundException('Active exam session not found');
        const q = await this.prisma.question.findFirst({ where: { id: questionId } });
        let isCorrect;
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
    async submitExam(sessionId, tenantId) {
        const session = await this.prisma.onlineExamSession.findFirst({
            where: { id: sessionId, tenantId, status: 'ONGOING' },
            include: { answers: { include: { question: true } } },
        });
        if (!session)
            throw new common_1.NotFoundException('Active exam session not found');
        const autoGraded = session.answers.reduce((s, a) => s + Number(a.marksAwarded ?? 0), 0);
        return this.prisma.onlineExamSession.update({
            where: { id: sessionId },
            data: { submittedAt: new Date(), status: 'SUBMITTED', obtainedMarks: autoGraded },
        });
    }
    async getSessionResults(sessionId, tenantId) {
        return this.prisma.onlineExamSession.findFirst({
            where: { id: sessionId, tenantId },
            include: { answers: { include: { question: true } } },
        });
    }
    async getBankStats(bankId, tenantId) {
        const bank = await this.prisma.questionBank.findFirst({ where: { id: bankId, tenantId } });
        if (!bank)
            throw new common_1.NotFoundException('Question bank not found');
        const [total, byType, byDiff] = await Promise.all([
            this.prisma.question.count({ where: { questionBankId: bankId, tenantId } }),
            this.prisma.question.groupBy({ by: ['type'], where: { questionBankId: bankId, tenantId }, _count: true }),
            this.prisma.question.groupBy({ by: ['difficulty'], where: { questionBankId: bankId, tenantId }, _count: true }),
        ]);
        return { bank, total, byType, byDiff };
    }
};
exports.QuestionBankService = QuestionBankService;
exports.QuestionBankService = QuestionBankService = QuestionBankService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuestionBankService);
//# sourceMappingURL=question-bank.service.js.map