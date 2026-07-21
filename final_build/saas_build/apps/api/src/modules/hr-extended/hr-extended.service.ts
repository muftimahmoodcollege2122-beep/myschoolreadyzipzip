import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class HrExtendedService {
  private readonly logger = new Logger(HrExtendedService.name);
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  // ── Lesson Plans ───────────────────────────────────────────
  async createLessonPlan(dto: any, tenantId: string, teacherId: string) {
    return this.prisma.lessonPlan.create({
      data: { tenantId, teacherId, classSubjectId: dto.classSubjectId, week: dto.week, title: dto.title,
              topic: dto.topic, objectives: dto.objectives ?? [], content: dto.content, activities: dto.activities ?? [],
              resources: dto.resources ?? [], assessment: dto.assessment, homework: dto.homework },
    });
  }

  async listLessonPlans(tenantId: string, teacherId?: string, week?: string, status?: string) {
    return this.prisma.lessonPlan.findMany({
      where: { tenantId, ...(teacherId && { teacherId }), ...(week && { week }), ...(status && { status }) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateLessonPlan(id: string, dto: any, tenantId: string) {
    const lp = await this.prisma.lessonPlan.findFirst({ where: { id, tenantId } });
    if (!lp) throw new NotFoundException('Lesson plan not found');
    return this.prisma.lessonPlan.update({ where: { id }, data: { ...dto, updatedAt: new Date() } });
  }

  async submitLessonPlan(id: string, tenantId: string) {
    return this.prisma.lessonPlan.update({ where: { id }, data: { status: 'SUBMITTED' } });
  }

  async approveLessonPlan(id: string, tenantId: string, approvedById: string) {
    return this.prisma.lessonPlan.update({ where: { id }, data: { status: 'APPROVED', approvedById, approvedAt: new Date() } });
  }

  async rejectLessonPlan(id: string, note: string, tenantId: string, approvedById: string) {
    return this.prisma.lessonPlan.update({ where: { id }, data: { status: 'REJECTED', approvedById, rejectionNote: note } });
  }

  // ── Substitutions ──────────────────────────────────────────
  async createSubstitution(dto: any, tenantId: string, assignedById: string) {
    return this.prisma.teacherSubstitution.create({
      data: { tenantId, substituteId: dto.substituteId, originalTeacherId: dto.originalTeacherId,
              timetableSlotId: dto.timetableSlotId, date: new Date(dto.date), period: dto.period,
              className: dto.className, subjectName: dto.subjectName, reason: dto.reason, notes: dto.notes, assignedById },
    });
  }

  async listSubstitutions(tenantId: string, date?: string, teacherId?: string) {
    return this.prisma.teacherSubstitution.findMany({
      where: { tenantId, ...(date && { date: new Date(date) }), ...(teacherId && { OR: [{ substituteId: teacherId }, { originalTeacherId: teacherId }] }) },
      orderBy: { date: 'desc' },
    });
  }

  async updateSubstitutionStatus(id: string, status: string, tenantId: string) {
    return this.prisma.teacherSubstitution.update({ where: { id }, data: { status, updatedAt: new Date() } });
  }

  // ── Training Records ───────────────────────────────────────
  async addTraining(dto: any, tenantId: string) {
    return this.prisma.trainingRecord.create({
      data: { tenantId, teacherId: dto.teacherId, title: dto.title, provider: dto.provider, type: dto.type,
              startDate: new Date(dto.startDate), endDate: dto.endDate ? new Date(dto.endDate) : undefined,
              location: dto.location, certificateUrl: dto.certificateUrl, status: dto.status ?? 'ENROLLED', hoursCompleted: dto.hoursCompleted, notes: dto.notes },
    });
  }

  async listTrainings(tenantId: string, teacherId?: string, status?: string) {
    return this.prisma.trainingRecord.findMany({
      where: { tenantId, ...(teacherId && { teacherId }), ...(status && { status }) },
      orderBy: { startDate: 'desc' },
    });
  }

  async completeTraining(id: string, tenantId: string, certificateUrl?: string) {
    return this.prisma.trainingRecord.update({ where: { id }, data: { status: 'COMPLETED', ...(certificateUrl && { certificateUrl }) } });
  }

  // ── Certifications ─────────────────────────────────────────
  async addCertification(dto: any, tenantId: string) {
    return this.prisma.teacherCertification.create({
      data: { tenantId, teacherId: dto.teacherId, title: dto.title, issuingBody: dto.issuingBody,
              issueDate: new Date(dto.issueDate), expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
              credentialId: dto.credentialId, fileUrl: dto.fileUrl },
    });
  }

  async listCertifications(tenantId: string, teacherId?: string) {
    return this.prisma.teacherCertification.findMany({
      where: { tenantId, ...(teacherId && { teacherId }) },
      orderBy: { issueDate: 'desc' },
    });
  }

  async verifyCertification(id: string, tenantId: string, verifiedById: string) {
    return this.prisma.teacherCertification.update({ where: { id }, data: { isVerified: true, verifiedById } });
  }

  // ── Payroll & Salary ───────────────────────────────────────
  async getPayrollSummary(tenantId: string, schoolId: string, month: string) {
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

  // ── Teacher Workload ───────────────────────────────────────
  async getTeacherWorkload(teacherId: string, tenantId: string) {
    const [slots, lessonPlans, substitutions, leaveRequests] = await Promise.all([
      this.prisma.timetableSlot.findMany({ where: { teacherId, tenantId } }),
      this.prisma.lessonPlan.count({ where: { teacherId, tenantId } }),
      this.prisma.teacherSubstitution.count({ where: { substituteId: teacherId, tenantId } }),
      this.prisma.leaveRequest.count({ where: { teacherId, tenantId } }),
    ]);
    const weeklyHours = slots.length * 1; // assuming 1hr per slot
    return { teacherId, weeklySlots: slots.length, weeklyHours, lessonPlans, substitutionsHandled: substitutions, leaveRequests, workloadLevel: weeklyHours > 30 ? 'HIGH' : weeklyHours > 20 ? 'MEDIUM' : 'NORMAL' };
  }
}
