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
var ExamsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let ExamsService = ExamsService_1 = class ExamsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ExamsService_1.name);
    }
    async create(dto, tenantId, createdById) {
        let schoolId = dto.schoolId;
        if (!schoolId) {
            const school = await this.prisma.school.findFirst({ where: { tenantId } });
            if (!school)
                throw new common_1.NotFoundException('School not found for this tenant');
            schoolId = school.id;
        }
        return this.prisma.$transaction(async (tx) => {
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
    async findAll(tenantId, schoolId, academicYear) {
        return this.prisma.exam.findMany({
            where: { tenantId, ...(academicYear && { academicYear }) },
            include: { subject: true },
            orderBy: { scheduledAt: 'asc' },
        });
    }
    async findOne(id, tenantId) {
        const exam = await this.prisma.exam.findFirst({
            where: { id, tenantId },
            include: { results: { include: { student: { include: { user: { include: { profile: true } } } } } } },
        });
        if (!exam)
            throw new common_1.NotFoundException('Exam not found');
        return exam;
    }
    async enterResults(examId, results, tenantId) {
        const exam = await this.prisma.exam.findFirst({ where: { id: examId, tenantId } });
        if (!exam)
            throw new common_1.NotFoundException('Exam not found');
        return this.prisma.$transaction(async (tx) => {
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
    async getSectionResults(examId, tenantId) {
        const results = await this.prisma.examResult.findMany({
            where: { examId, tenantId },
            include: { student: { include: { user: { include: { profile: true } } } } },
            orderBy: { marksObtained: 'desc' },
        });
        return results.map((r, i) => ({ ...r, rank: i + 1 }));
    }
};
exports.ExamsService = ExamsService;
exports.ExamsService = ExamsService = ExamsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExamsService);
//# sourceMappingURL=exams.service.js.map