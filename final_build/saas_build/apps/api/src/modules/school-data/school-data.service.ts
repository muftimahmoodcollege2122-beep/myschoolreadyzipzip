import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class SchoolDataService {
  private readonly logger = new Logger(SchoolDataService.name);
  constructor(private readonly prisma: PrismaService) {}

  private async resolveSchoolId(tenantId: string, sid?: string): Promise<string | undefined> {
    if (sid && UUID_RE.test(sid)) return sid;
    const s = await this.prisma.school.findFirst({ where: { tenantId, isActive: true }, select: { id: true } });
    return s?.id;
  }

  // ── Classes ────────────────────────────────────────────────────────────────
  async listClasses(tenantId: string, schoolId: string) {
    const sid = await this.resolveSchoolId(tenantId, schoolId);
    return this.prisma.class.findMany({
      where: { tenantId, ...(sid && { schoolId: sid }), isActive: true },
      include: { sections: { orderBy: { name: 'asc' }, include: { _count: { select: { students: true } } } }, _count: { select: { sections: true } } },
      orderBy: { level: 'asc' },
    });
  }

  async createClass(tenantId: string, schoolId: string, dto: any) {
    const sid = await this.resolveSchoolId(tenantId, schoolId);
    return this.prisma.class.create({ data: { tenantId, schoolId: sid!, name: dto.name, level: Number(dto.level), academicYear: dto.academicYear ?? '2025-2026' } });
  }

  async updateClass(tenantId: string, id: string, dto: any) {
    const c = await this.prisma.class.findFirst({ where: { id, tenantId } });
    if (!c) throw new NotFoundException('Class not found');
    return this.prisma.class.update({ where: { id }, data: { name: dto.name, isActive: dto.isActive } });
  }

  // ── Sections ───────────────────────────────────────────────────────────────
  async listSections(tenantId: string, schoolId: string, classId?: string) {
    const sid = await this.resolveSchoolId(tenantId, schoolId);
    return this.prisma.section.findMany({
      where: { tenantId, ...(sid && { schoolId: sid }), ...(classId && { classId }) },
      include: { class: true, _count: { select: { students: true } } },
      orderBy: [{ class: { level: 'asc' } }, { name: 'asc' }],
    });
  }

  async createSection(tenantId: string, schoolId: string, dto: any) {
    const sid = await this.resolveSchoolId(tenantId, schoolId);
    return this.prisma.section.create({ data: { tenantId, schoolId: sid!, classId: dto.classId, name: dto.name, capacity: Number(dto.capacity ?? 40), roomNumber: dto.roomNumber } });
  }

  // ── Subjects ───────────────────────────────────────────────────────────────
  async listSubjects(tenantId: string, schoolId: string) {
    const sid = await this.resolveSchoolId(tenantId, schoolId);
    return this.prisma.subject.findMany({
      where: { tenantId, ...(sid && { schoolId: sid }) },
      include: { _count: { select: { classSubjects: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createSubject(tenantId: string, schoolId: string, dto: any) {
    const sid = await this.resolveSchoolId(tenantId, schoolId);
    return this.prisma.subject.create({ data: { tenantId, schoolId: sid!, name: dto.name, code: dto.code, description: dto.description, isElective: dto.isElective ?? false, creditHours: Number(dto.creditHours ?? 1) } });
  }

  // ── Staff ──────────────────────────────────────────────────────────────────
  async listStaff(tenantId: string, schoolId: string, page = 1, limit = 20, search?: string) {
    const sid = await this.resolveSchoolId(tenantId, schoolId);
    const where: any = { tenantId, ...(sid && { schoolId: sid }), isActive: true, ...(search && { OR: [{ designation: { contains: search, mode: 'insensitive' } }, { user: { profile: { OR: [{ firstName: { contains: search, mode: 'insensitive' } }, { lastName: { contains: search, mode: 'insensitive' } }] } } }] }) };
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      this.prisma.staff.findMany({ where, skip, take: Number(limit), include: { user: { include: { profile: true } } }, orderBy: { createdAt: 'desc' } }),
      this.prisma.staff.count({ where }),
    ]);
    return { data, meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
  }

  async createStaff(tenantId: string, schoolId: string, dto: any) {
    const sid = await this.resolveSchoolId(tenantId, schoolId);
    const existing = await this.prisma.user.findFirst({ where: { tenantId, email: dto.email } });
    if (existing) {
      const staff = await this.prisma.staff.create({ data: { tenantId, schoolId: sid!, userId: existing.id, employeeId: dto.employeeId, designation: dto.designation, department: dto.department, joiningDate: new Date(dto.joiningDate), salary: dto.salary ? Number(dto.salary) : undefined } });
      return staff;
    }
    return this.prisma.$transaction(async tx => {
      const user = await tx.user.create({ data: { tenantId, email: dto.email, role: 'TEACHER', profile: { create: { firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone } } } });
      return tx.staff.create({ data: { tenantId, schoolId: sid!, userId: user.id, employeeId: dto.employeeId, designation: dto.designation, department: dto.department, joiningDate: new Date(dto.joiningDate), salary: dto.salary ? Number(dto.salary) : undefined } });
    });
  }

  // ── Events ─────────────────────────────────────────────────────────────────
  async listEvents(tenantId: string, schoolId: string, upcoming = false) {
    const sid = await this.resolveSchoolId(tenantId, schoolId);
    const where: any = { tenantId, ...(sid && { schoolId: sid }), ...(upcoming && { startAt: { gte: new Date() } }) };
    return this.prisma.schoolEvent.findMany({ where, orderBy: { startAt: 'asc' }, take: 50 });
  }

  async createEvent(tenantId: string, schoolId: string, dto: any) {
    const sid = await this.resolveSchoolId(tenantId, schoolId);
    return this.prisma.schoolEvent.create({ data: { tenantId, schoolId: sid!, title: dto.title, description: dto.description, startAt: new Date(dto.startAt), endAt: new Date(dto.endAt), venue: dto.venue, isPublic: dto.isPublic ?? false } });
  }

  async deleteEvent(tenantId: string, id: string) {
    const e = await this.prisma.schoolEvent.findFirst({ where: { id, tenantId } });
    if (!e) throw new NotFoundException('Event not found');
    await this.prisma.schoolEvent.delete({ where: { id } });
    return { success: true };
  }

  // ── School overview ────────────────────────────────────────────────────────
  async getSchoolInfo(tenantId: string) {
    return this.prisma.school.findFirst({ where: { tenantId, isActive: true } });
  }

  async updateSchoolInfo(tenantId: string, dto: any) {
    const school = await this.prisma.school.findFirst({ where: { tenantId, isActive: true } });
    if (!school) throw new NotFoundException('School not found');
    return this.prisma.school.update({ where: { id: school.id }, data: { name: dto.name, phone: dto.phone, email: dto.email, website: dto.website } });
  }

  // ── Announcements ──────────────────────────────────────────────────────────
  async listAnnouncements(tenantId: string, page = 1, limit = 20) {
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      this.prisma.announcement.findMany({ where: { tenantId }, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
      this.prisma.announcement.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
  }

  async createAnnouncement(tenantId: string, createdById: string, dto: any) {
    const sid = await this.resolveSchoolId(tenantId);
    return this.prisma.announcement.create({ data: { tenantId, schoolId: sid!, createdById, title: dto.title, body: dto.content ?? dto.body ?? '', targetRoles: dto.targetRoles ?? [], isPinned: dto.isPinned ?? false, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined } });
  }

  // ── Departments ────────────────────────────────────────────────────────────
  async listDepartments(tenantId: string, schoolId: string) {
    const sid = await this.resolveSchoolId(tenantId, schoolId);
    return this.prisma.department.findMany({ where: { tenantId, ...(sid && { schoolId: sid }) }, orderBy: { name: 'asc' } });
  }
}
