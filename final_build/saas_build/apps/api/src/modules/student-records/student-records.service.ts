import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class StudentRecordsService {
  private readonly logger = new Logger(StudentRecordsService.name);
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  // ── Behavior Records ───────────────────────────────────────
  async logBehavior(dto: any, tenantId: string, reportedById: string) {
    const r = await this.prisma.studentBehavior.create({
      data: { tenantId, studentId: dto.studentId, type: dto.type, category: dto.category, description: dto.description,
              severity: dto.severity ?? 'LOW', actionTaken: dto.actionTaken, reportedById, incidentDate: new Date(dto.incidentDate) },
    });
    await this.audit.log({ tenantId, userId: reportedById, action: 'CREATE', entity: 'StudentBehavior', entityId: r.id, after: dto });
    return r;
  }

  async getBehaviorHistory(studentId: string, tenantId: string, type?: string, limit = 20) {
    return this.prisma.studentBehavior.findMany({
      where: { studentId, tenantId, ...(type && { type }) },
      orderBy: { incidentDate: 'desc' },
      take: limit,
    });
  }

  async resolveBehavior(id: string, tenantId: string, userId: string) {
    const r = await this.prisma.studentBehavior.findFirst({ where: { id, tenantId } });
    if (!r) throw new NotFoundException('Behavior record not found');
    return this.prisma.studentBehavior.update({ where: { id }, data: { resolved: true, resolvedAt: new Date() } });
  }

  async getBehaviorStats(tenantId: string, schoolId?: string) {
    const [positives, negatives, critical] = await Promise.all([
      this.prisma.studentBehavior.count({ where: { tenantId, type: 'POSITIVE' } }),
      this.prisma.studentBehavior.count({ where: { tenantId, type: 'NEGATIVE' } }),
      this.prisma.studentBehavior.count({ where: { tenantId, type: 'NEGATIVE', severity: 'CRITICAL', resolved: false } }),
    ]);
    return { positives, negatives, critical, total: positives + negatives };
  }

  // ── Medical Records ────────────────────────────────────────
  async upsertMedical(studentId: string, dto: any, tenantId: string, userId: string) {
    return this.prisma.studentMedicalRecord.upsert({
      where: { studentId },
      create: { tenantId, studentId, ...dto, lastUpdatedById: userId },
      update: { ...dto, lastUpdatedById: userId, updatedAt: new Date() },
    });
  }

  async getMedical(studentId: string, tenantId: string) {
    const m = await this.prisma.studentMedicalRecord.findFirst({ where: { studentId, tenantId } });
    if (!m) return { studentId, tenantId, bloodGroup: null, allergies: [], chronicConditions: [], currentMedications: [], vaccinations: [], notes: null };
    return m;
  }

  // ── Achievements ───────────────────────────────────────────
  async addAchievement(dto: any, tenantId: string, createdById: string) {
    return this.prisma.studentAchievement.create({
      data: { tenantId, studentId: dto.studentId, type: dto.type, title: dto.title, description: dto.description,
              awardedBy: dto.awardedBy, awardedAt: new Date(dto.awardedAt), certificateUrl: dto.certificateUrl, isPublic: dto.isPublic ?? true },
    });
  }

  async getAchievements(studentId: string, tenantId: string) {
    return this.prisma.studentAchievement.findMany({ where: { studentId, tenantId }, orderBy: { awardedAt: 'desc' } });
  }

  async deleteAchievement(id: string, tenantId: string) {
    const a = await this.prisma.studentAchievement.findFirst({ where: { id, tenantId } });
    if (!a) throw new NotFoundException('Achievement not found');
    return this.prisma.studentAchievement.delete({ where: { id } });
  }

  // ── Warnings ───────────────────────────────────────────────
  async issueWarning(dto: any, tenantId: string, issuedById: string) {
    return this.prisma.studentWarning.create({
      data: { tenantId, studentId: dto.studentId, type: dto.type, description: dto.description,
              severity: dto.severity ?? 'MINOR', issuedById, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined },
    });
  }

  async getWarnings(studentId: string, tenantId: string, active = true) {
    const where: any = { studentId, tenantId };
    if (active) { where.resolved = false; where.OR = [{ expiresAt: null }, { expiresAt: { gte: new Date() } }]; }
    return this.prisma.studentWarning.findMany({ where, orderBy: { issuedAt: 'desc' } });
  }

  async resolveWarning(id: string, tenantId: string, resolvedById: string) {
    const w = await this.prisma.studentWarning.findFirst({ where: { id, tenantId } });
    if (!w) throw new NotFoundException('Warning not found');
    return this.prisma.studentWarning.update({ where: { id }, data: { resolved: true, resolvedAt: new Date(), resolvedById } });
  }

  // ── Disciplinary Summary ───────────────────────────────────
  async getDisciplinarySummary(studentId: string, tenantId: string) {
    const [behaviors, warnings, achievements] = await Promise.all([
      this.prisma.studentBehavior.findMany({ where: { studentId, tenantId }, orderBy: { incidentDate: 'desc' }, take: 10 }),
      this.prisma.studentWarning.findMany({ where: { studentId, tenantId, resolved: false }, orderBy: { issuedAt: 'desc' } }),
      this.prisma.studentAchievement.findMany({ where: { studentId, tenantId }, orderBy: { awardedAt: 'desc' }, take: 5 }),
    ]);
    return { behaviors, warnings, achievements, riskLevel: warnings.some(w => w.severity === 'CRITICAL') ? 'HIGH' : warnings.length > 2 ? 'MEDIUM' : 'LOW' };
  }
}
