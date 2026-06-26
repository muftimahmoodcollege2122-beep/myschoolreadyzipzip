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
var StudentRecordsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentRecordsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../../common/audit/audit.service");
let StudentRecordsService = StudentRecordsService_1 = class StudentRecordsService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
        this.logger = new common_1.Logger(StudentRecordsService_1.name);
    }
    async logBehavior(dto, tenantId, reportedById) {
        const r = await this.prisma.studentBehavior.create({
            data: { tenantId, studentId: dto.studentId, type: dto.type, category: dto.category, description: dto.description,
                severity: dto.severity ?? 'LOW', actionTaken: dto.actionTaken, reportedById, incidentDate: new Date(dto.incidentDate) },
        });
        await this.audit.log({ tenantId, userId: reportedById, action: 'CREATE', entity: 'StudentBehavior', entityId: r.id, after: dto });
        return r;
    }
    async getBehaviorHistory(studentId, tenantId, type, limit = 20) {
        return this.prisma.studentBehavior.findMany({
            where: { studentId, tenantId, ...(type && { type }) },
            orderBy: { incidentDate: 'desc' },
            take: limit,
        });
    }
    async resolveBehavior(id, tenantId, userId) {
        const r = await this.prisma.studentBehavior.findFirst({ where: { id, tenantId } });
        if (!r)
            throw new common_1.NotFoundException('Behavior record not found');
        return this.prisma.studentBehavior.update({ where: { id }, data: { resolved: true, resolvedAt: new Date() } });
    }
    async getBehaviorStats(tenantId, schoolId) {
        const [positives, negatives, critical] = await Promise.all([
            this.prisma.studentBehavior.count({ where: { tenantId, type: 'POSITIVE' } }),
            this.prisma.studentBehavior.count({ where: { tenantId, type: 'NEGATIVE' } }),
            this.prisma.studentBehavior.count({ where: { tenantId, type: 'NEGATIVE', severity: 'CRITICAL', resolved: false } }),
        ]);
        return { positives, negatives, critical, total: positives + negatives };
    }
    async upsertMedical(studentId, dto, tenantId, userId) {
        return this.prisma.studentMedicalRecord.upsert({
            where: { studentId },
            create: { tenantId, studentId, ...dto, lastUpdatedById: userId },
            update: { ...dto, lastUpdatedById: userId, updatedAt: new Date() },
        });
    }
    async getMedical(studentId, tenantId) {
        const m = await this.prisma.studentMedicalRecord.findFirst({ where: { studentId, tenantId } });
        if (!m)
            return { studentId, tenantId, bloodGroup: null, allergies: [], chronicConditions: [], currentMedications: [], vaccinations: [], notes: null };
        return m;
    }
    async addAchievement(dto, tenantId, createdById) {
        return this.prisma.studentAchievement.create({
            data: { tenantId, studentId: dto.studentId, type: dto.type, title: dto.title, description: dto.description,
                awardedBy: dto.awardedBy, awardedAt: new Date(dto.awardedAt), certificateUrl: dto.certificateUrl, isPublic: dto.isPublic ?? true },
        });
    }
    async getAchievements(studentId, tenantId) {
        return this.prisma.studentAchievement.findMany({ where: { studentId, tenantId }, orderBy: { awardedAt: 'desc' } });
    }
    async deleteAchievement(id, tenantId) {
        const a = await this.prisma.studentAchievement.findFirst({ where: { id, tenantId } });
        if (!a)
            throw new common_1.NotFoundException('Achievement not found');
        return this.prisma.studentAchievement.delete({ where: { id } });
    }
    async issueWarning(dto, tenantId, issuedById) {
        return this.prisma.studentWarning.create({
            data: { tenantId, studentId: dto.studentId, type: dto.type, description: dto.description,
                severity: dto.severity ?? 'MINOR', issuedById, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined },
        });
    }
    async getWarnings(studentId, tenantId, active = true) {
        const where = { studentId, tenantId };
        if (active) {
            where.resolved = false;
            where.OR = [{ expiresAt: null }, { expiresAt: { gte: new Date() } }];
        }
        return this.prisma.studentWarning.findMany({ where, orderBy: { issuedAt: 'desc' } });
    }
    async resolveWarning(id, tenantId, resolvedById) {
        const w = await this.prisma.studentWarning.findFirst({ where: { id, tenantId } });
        if (!w)
            throw new common_1.NotFoundException('Warning not found');
        return this.prisma.studentWarning.update({ where: { id }, data: { resolved: true, resolvedAt: new Date(), resolvedById } });
    }
    async getDisciplinarySummary(studentId, tenantId) {
        const [behaviors, warnings, achievements] = await Promise.all([
            this.prisma.studentBehavior.findMany({ where: { studentId, tenantId }, orderBy: { incidentDate: 'desc' }, take: 10 }),
            this.prisma.studentWarning.findMany({ where: { studentId, tenantId, resolved: false }, orderBy: { issuedAt: 'desc' } }),
            this.prisma.studentAchievement.findMany({ where: { studentId, tenantId }, orderBy: { awardedAt: 'desc' }, take: 5 }),
        ]);
        return { behaviors, warnings, achievements, riskLevel: warnings.some(w => w.severity === 'CRITICAL') ? 'HIGH' : warnings.length > 2 ? 'MEDIUM' : 'LOW' };
    }
};
exports.StudentRecordsService = StudentRecordsService;
exports.StudentRecordsService = StudentRecordsService = StudentRecordsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], StudentRecordsService);
//# sourceMappingURL=student-records.service.js.map