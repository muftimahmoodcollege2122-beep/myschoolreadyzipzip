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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var GradesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../../common/audit/audit.service");
const bull_1 = require("@nestjs/bull");
const GRADING_SCALE = [
    { grade: 'A+', min: 95, gpa: 4.0 }, { grade: 'A', min: 90, gpa: 4.0 },
    { grade: 'A-', min: 85, gpa: 3.7 }, { grade: 'B+', min: 80, gpa: 3.3 },
    { grade: 'B', min: 75, gpa: 3.0 }, { grade: 'B-', min: 70, gpa: 2.7 },
    { grade: 'C+', min: 65, gpa: 2.3 }, { grade: 'C', min: 60, gpa: 2.0 },
    { grade: 'D', min: 50, gpa: 1.0 }, { grade: 'F', min: 0, gpa: 0.0 },
];
let GradesService = GradesService_1 = class GradesService {
    constructor(prisma, audit, reportsQueue) {
        this.prisma = prisma;
        this.audit = audit;
        this.reportsQueue = reportsQueue;
        this.logger = new common_1.Logger(GradesService_1.name);
    }
    async createGrade(dto, tenantId, teacherId) {
        const classSubject = await this.prisma.classSubject.findFirst({
            where: { id: dto.classSubjectId, teacherId, tenantId },
        });
        if (!classSubject)
            throw new common_1.BadRequestException('Not assigned to this class-subject');
        const grade = await this.prisma.grade.create({
            data: {
                studentId: dto.studentId,
                classSubjectId: dto.classSubjectId,
                teacherId,
                tenantId,
                academicYear: dto.academicYear,
                term: dto.term,
                assessmentType: dto.assessmentType,
                title: dto.title,
                score: dto.score,
                maxScore: dto.maxScore,
                weight: dto.weight ?? 1.0,
                remarks: dto.remarks,
            },
        });
        await this.audit.log({
            tenantId, userId: teacherId, action: 'CREATE', entity: 'Grade', entityId: grade.id,
            after: { studentId: dto.studentId, score: dto.score, maxScore: dto.maxScore },
        });
        return grade;
    }
    async getStudentGrades(studentId, tenantId, academicYear, term) {
        return this.prisma.grade.findMany({
            where: { studentId, tenantId, academicYear, ...(term && { term }) },
            include: { classSubject: { include: { subject: true } } },
            orderBy: [{ term: 'asc' }, { gradedAt: 'asc' }],
        });
    }
    async getStudentReportCard(studentId, tenantId, academicYear, term) {
        const student = await this.prisma.student.findFirst({
            where: { id: studentId, tenantId },
        });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        const grades = await this.prisma.grade.findMany({
            where: { studentId, tenantId, academicYear, term },
            include: { classSubject: { include: { subject: true } } },
        });
        const subjectMap = new Map();
        for (const g of grades) {
            const sid = g.classSubject.subjectId;
            if (!subjectMap.has(sid))
                subjectMap.set(sid, []);
            subjectMap.get(sid).push(g);
        }
        const subjects = [];
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
    async getSectionGradebook(sectionId, classSubjectId, tenantId, term, academicYear) {
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
    async queueReportCardGeneration(studentIds, tenantId, academicYear, term, requestedById) {
        const job = await this.reportsQueue.add('generate-report-cards', { studentIds, tenantId, academicYear, term, requestedById }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });
        return String(job.id);
    }
    getLetterGrade(percentage) {
        for (const scale of GRADING_SCALE) {
            if (percentage >= scale.min)
                return { grade: scale.grade, gpa: scale.gpa };
        }
        return { grade: 'F', gpa: 0.0 };
    }
};
exports.GradesService = GradesService;
exports.GradesService = GradesService = GradesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bull_1.InjectQueue)('reports')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService, Object])
], GradesService);
//# sourceMappingURL=grades.service.js.map