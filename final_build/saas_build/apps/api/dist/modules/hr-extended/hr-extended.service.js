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
var HrExtendedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HrExtendedService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../../common/audit/audit.service");
let HrExtendedService = HrExtendedService_1 = class HrExtendedService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
        this.logger = new common_1.Logger(HrExtendedService_1.name);
    }
    async createLessonPlan(dto, tenantId, teacherId) {
        return this.prisma.lessonPlan.create({
            data: { tenantId, teacherId, classSubjectId: dto.classSubjectId, week: dto.week, title: dto.title,
                topic: dto.topic, objectives: dto.objectives ?? [], content: dto.content, activities: dto.activities ?? [],
                resources: dto.resources ?? [], assessment: dto.assessment, homework: dto.homework },
        });
    }
    async listLessonPlans(tenantId, teacherId, week, status) {
        return this.prisma.lessonPlan.findMany({
            where: { tenantId, ...(teacherId && { teacherId }), ...(week && { week }), ...(status && { status }) },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateLessonPlan(id, dto, tenantId) {
        const lp = await this.prisma.lessonPlan.findFirst({ where: { id, tenantId } });
        if (!lp)
            throw new common_1.NotFoundException('Lesson plan not found');
        return this.prisma.lessonPlan.update({ where: { id }, data: { ...dto, updatedAt: new Date() } });
    }
    async submitLessonPlan(id, tenantId) {
        return this.prisma.lessonPlan.update({ where: { id }, data: { status: 'SUBMITTED' } });
    }
    async approveLessonPlan(id, tenantId, approvedById) {
        return this.prisma.lessonPlan.update({ where: { id }, data: { status: 'APPROVED', approvedById, approvedAt: new Date() } });
    }
    async rejectLessonPlan(id, note, tenantId, approvedById) {
        return this.prisma.lessonPlan.update({ where: { id }, data: { status: 'REJECTED', approvedById, rejectionNote: note } });
    }
    async createSubstitution(dto, tenantId, assignedById) {
        return this.prisma.teacherSubstitution.create({
            data: { tenantId, substituteId: dto.substituteId, originalTeacherId: dto.originalTeacherId,
                timetableSlotId: dto.timetableSlotId, date: new Date(dto.date), period: dto.period,
                className: dto.className, subjectName: dto.subjectName, reason: dto.reason, notes: dto.notes, assignedById },
        });
    }
    async listSubstitutions(tenantId, date, teacherId) {
        return this.prisma.teacherSubstitution.findMany({
            where: { tenantId, ...(date && { date: new Date(date) }), ...(teacherId && { OR: [{ substituteId: teacherId }, { originalTeacherId: teacherId }] }) },
            orderBy: { date: 'desc' },
        });
    }
    async updateSubstitutionStatus(id, status, tenantId) {
        return this.prisma.teacherSubstitution.update({ where: { id }, data: { status, updatedAt: new Date() } });
    }
    async addTraining(dto, tenantId) {
        return this.prisma.trainingRecord.create({
            data: { tenantId, teacherId: dto.teacherId, title: dto.title, provider: dto.provider, type: dto.type,
                startDate: new Date(dto.startDate), endDate: dto.endDate ? new Date(dto.endDate) : undefined,
                location: dto.location, certificateUrl: dto.certificateUrl, status: dto.status ?? 'ENROLLED', hoursCompleted: dto.hoursCompleted, notes: dto.notes },
        });
    }
    async listTrainings(tenantId, teacherId, status) {
        return this.prisma.trainingRecord.findMany({
            where: { tenantId, ...(teacherId && { teacherId }), ...(status && { status }) },
            orderBy: { startDate: 'desc' },
        });
    }
    async completeTraining(id, tenantId, certificateUrl) {
        return this.prisma.trainingRecord.update({ where: { id }, data: { status: 'COMPLETED', ...(certificateUrl && { certificateUrl }) } });
    }
    async addCertification(dto, tenantId) {
        return this.prisma.teacherCertification.create({
            data: { tenantId, teacherId: dto.teacherId, title: dto.title, issuingBody: dto.issuingBody,
                issueDate: new Date(dto.issueDate), expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
                credentialId: dto.credentialId, fileUrl: dto.fileUrl },
        });
    }
    async listCertifications(tenantId, teacherId) {
        return this.prisma.teacherCertification.findMany({
            where: { tenantId, ...(teacherId && { teacherId }) },
            orderBy: { issueDate: 'desc' },
        });
    }
    async verifyCertification(id, tenantId, verifiedById) {
        return this.prisma.teacherCertification.update({ where: { id }, data: { isVerified: true, verifiedById } });
    }
    async getPayrollSummary(tenantId, schoolId, month) {
        const [teachers, staff] = await Promise.all([
            this.prisma.teacher.findMany({ where: { tenantId, schoolId, isActive: true }, include: { user: { include: { profile: true } } } }),
            this.prisma.staff.findMany({ where: { tenantId, schoolId, isActive: true }, include: { user: { include: { profile: true } } } }),
        ]);
        const teacherPayroll = teachers.map(t => ({ id: t.id, name: `${t.user.profile?.firstName} ${t.user.profile?.lastName}`, designation: 'Teacher', salary: t.salary, employeeId: t.employeeId }));
        const staffPayroll = staff.map(s => ({ id: s.id, name: `${s.user.profile?.firstName} ${s.user.profile?.lastName}`, designation: s.designation, salary: s.salary, employeeId: s.employeeId }));
        const all = [...teacherPayroll, ...staffPayroll];
        const totalPayroll = all.reduce((s, e) => s + Number(e.salary ?? 0), 0);
        return { month, employees: all, totalPayroll, teacherCount: teachers.length, staffCount: staff.length };
    }
    async getTeacherWorkload(teacherId, tenantId) {
        const [slots, lessonPlans, substitutions, leaveRequests] = await Promise.all([
            this.prisma.timetableSlot.findMany({ where: { teacherId, tenantId } }),
            this.prisma.lessonPlan.count({ where: { teacherId, tenantId } }),
            this.prisma.teacherSubstitution.count({ where: { substituteId: teacherId, tenantId } }),
            this.prisma.leaveRequest.count({ where: { teacherId, tenantId } }),
        ]);
        const weeklyHours = slots.length * 1;
        return { teacherId, weeklySlots: slots.length, weeklyHours, lessonPlans, substitutionsHandled: substitutions, leaveRequests, workloadLevel: weeklyHours > 30 ? 'HIGH' : weeklyHours > 20 ? 'MEDIUM' : 'NORMAL' };
    }
};
exports.HrExtendedService = HrExtendedService;
exports.HrExtendedService = HrExtendedService = HrExtendedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], HrExtendedService);
//# sourceMappingURL=hr-extended.service.js.map