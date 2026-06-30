import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class SchoolDataService {
  private readonly logger = new Logger(SchoolDataService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  private async resolveSchoolId(tenantId: string, sid?: string): Promise<string | undefined> {
    if (sid && UUID_RE.test(sid)) return sid;
    const s = await this.prisma.school.findFirst({ where: { tenantId }, select: { id: true } });
    return s?.id;
  }

  private async getSchool(tenantId: string) {
    const s = await this.prisma.school.findFirst({ where: { tenantId } });
    if (!s) throw new NotFoundException('School not found');
    return s;
  }

  // ── Generic Section CRUD (stores arrays in school.settings[section]) ─────────
  async getSection(tenantId: string, section: string) {
    const school = await this.prisma.school.findFirst({ where: { tenantId }, select: { settings: true } });
    if (!school) return [];
    const data = (school.settings as any)?.[section];
    return Array.isArray(data) ? data : [];
  }

  async createSectionItem(tenantId: string, section: string, dto: any) {
    const school = await this.getSchool(tenantId);
    const settings = (school.settings as any) || {};
    const items: any[] = Array.isArray(settings[section]) ? settings[section] : [];
    const newItem = { id: `${section.slice(0, 3)}${Date.now()}`, ...dto, createdAt: new Date().toISOString() };
    await this.prisma.school.update({ where: { id: school.id }, data: { settings: { ...settings, [section]: [...items, newItem] } } });
    return newItem;
  }

  async updateSectionItem(tenantId: string, section: string, itemId: string, dto: any) {
    const school = await this.getSchool(tenantId);
    const settings = (school.settings as any) || {};
    const items: any[] = Array.isArray(settings[section]) ? settings[section] : [];
    const idx = items.findIndex((i: any) => i.id === itemId);
    if (idx === -1) throw new NotFoundException('Item not found');
    items[idx] = { ...items[idx], ...dto };
    await this.prisma.school.update({ where: { id: school.id }, data: { settings: { ...settings, [section]: items } } });
    return items[idx];
  }

  async deleteSectionItem(tenantId: string, section: string, itemId: string) {
    const school = await this.getSchool(tenantId);
    const settings = (school.settings as any) || {};
    const items = (Array.isArray(settings[section]) ? settings[section] : []).filter((i: any) => i.id !== itemId);
    await this.prisma.school.update({ where: { id: school.id }, data: { settings: { ...settings, [section]: items } } });
    return { success: true };
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
      return this.prisma.staff.create({ data: { tenantId, schoolId: sid!, userId: existing.id, employeeId: dto.employeeId, designation: dto.designation, department: dto.department, joiningDate: new Date(dto.joiningDate), salary: dto.salary ? Number(dto.salary) : undefined } });
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
    return this.prisma.school.findFirst({ where: { tenantId } });
  }

  async updateSchoolInfo(tenantId: string, dto: any) {
    const school = await this.getSchool(tenantId);
    const currentSettings = (school.settings as any) || {};
    const currentAddress = (school.address as any) || {};
    return this.prisma.school.update({
      where: { id: school.id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.website !== undefined && { website: dto.website }),
        ...(dto.academicYear !== undefined && { academicYear: dto.academicYear }),
        address: { ...currentAddress, ...(dto.address && { street: dto.address }), ...(dto.city && { city: dto.city }), ...(dto.country && { country: dto.country }) },
        settings: { ...currentSettings, profile: { ...(currentSettings.profile || {}), ...(dto.principalName !== undefined && { principalName: dto.principalName }), ...(dto.registrationNo !== undefined && { registrationNo: dto.registrationNo }) } },
      },
    });
  }

  // ── LMS ────────────────────────────────────────────────────────────────────
  async getLmsData(tenantId: string) {
    const school = await this.prisma.school.findFirst({ where: { tenantId }, select: { settings: true } });
    if (!school) return { courses: [] };
    return { courses: ((school.settings as any)?.lms?.courses) || [] };
  }

  async createLmsCourse(tenantId: string, dto: any) {
    const school = await this.getSchool(tenantId);
    const settings = (school.settings as any) || {};
    const courses = settings.lms?.courses || [];
    const EMOJIS = ['📐','⚛️','📖','✍️','🧬','💻','🌍','🎨','🔬','📊','🎭','📚'];
    const newCourse = { id: `c${Date.now()}`, title: dto.title, subject: dto.subject, description: dto.description || '', teacher: dto.teacher || '', status: 'DRAFT', lessons: 0, assignments: 0, students: 0, progress: 0, thumb: EMOJIS[courses.length % EMOJIS.length], createdAt: new Date().toISOString() };
    await this.prisma.school.update({ where: { id: school.id }, data: { settings: { ...settings, lms: { courses: [...courses, newCourse] } } } });
    return newCourse;
  }

  async updateLmsCourse(tenantId: string, courseId: string, dto: any) {
    const school = await this.getSchool(tenantId);
    const settings = (school.settings as any) || {};
    const courses: any[] = settings.lms?.courses || [];
    const idx = courses.findIndex((c: any) => c.id === courseId);
    if (idx === -1) throw new NotFoundException('Course not found');
    courses[idx] = { ...courses[idx], ...dto };
    await this.prisma.school.update({ where: { id: school.id }, data: { settings: { ...settings, lms: { courses } } } });
    return courses[idx];
  }

  async deleteLmsCourse(tenantId: string, courseId: string) {
    const school = await this.getSchool(tenantId);
    const settings = (school.settings as any) || {};
    const courses = (settings.lms?.courses || []).filter((c: any) => c.id !== courseId);
    await this.prisma.school.update({ where: { id: school.id }, data: { settings: { ...settings, lms: { courses } } } });
    return { success: true };
  }

  // ── Website Settings ────────────────────────────────────────────────────────
  async getWebsiteSettings(tenantId: string) {
    const school = await this.prisma.school.findFirst({ where: { tenantId }, select: { settings: true } });
    if (!school) return {};
    return (school.settings as any)?.website || {};
  }

  async saveWebsiteSettings(tenantId: string, dto: any) {
    const school = await this.getSchool(tenantId);
    const settings = (school.settings as any) || {};
    await this.prisma.school.update({ where: { id: school.id }, data: { settings: { ...settings, website: dto } } });

    // Also sync to tenant.settings.theme — this is what the public school website (themes.service) reads
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (tenant) {
      const tenantSettings = (tenant.settings as any) || {};
      const existingTheme = tenantSettings.theme || {};
      const newTheme = {
        ...existingTheme,
        ...(dto.theme && typeof dto.theme === 'object' ? dto.theme : {}),
        preset: dto.theme?.preset ?? existingTheme.preset,
        template: dto.theme?.template ?? dto.template ?? existingTheme.template,
        primaryColor: dto.theme?.primaryColor ?? dto.primaryColor ?? existingTheme.primaryColor,
        secondaryColor: dto.theme?.secondaryColor ?? dto.secondaryColor ?? existingTheme.secondaryColor,
        accentColor: dto.theme?.accentColor ?? dto.accentColor ?? existingTheme.accentColor,
      };
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { settings: { ...tenantSettings, theme: newTheme, components: dto.components ?? tenantSettings.components } },
      });
      // Invalidate the public website theme cache so changes show immediately
      await this.cache.del(`theme:${tenant.slug}`).catch(() => {});
    }

    return { success: true, ...dto };
  }

  // ── Backup ─────────────────────────────────────────────────────────────────
  async getBackup(tenantId: string) {
    const [school, students, teachers, classes, subjects, sections, announcements, events] = await Promise.all([
      this.prisma.school.findFirst({ where: { tenantId } }),
      this.prisma.student.findMany({ where: { tenantId }, include: { user: { include: { profile: true } } } }),
      this.prisma.teacher.findMany({ where: { tenantId }, include: { user: { include: { profile: true } } } }),
      this.prisma.class.findMany({ where: { tenantId } }),
      this.prisma.subject.findMany({ where: { tenantId } }),
      this.prisma.section.findMany({ where: { tenantId } }),
      this.prisma.announcement.findMany({ where: { tenantId }, take: 200, orderBy: { createdAt: 'desc' } }),
      this.prisma.schoolEvent.findMany({ where: { tenantId }, take: 200, orderBy: { createdAt: 'desc' } }),
    ]);
    return { exportedAt: new Date().toISOString(), version: '1.0', tenantId, summary: { students: students.length, teachers: teachers.length, classes: classes.length, subjects: subjects.length, sections: sections.length, announcements: announcements.length, events: events.length }, school, students, teachers, classes, subjects, sections, announcements, events };
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

  async deleteAnnouncement(tenantId: string, id: string) {
    const a = await this.prisma.announcement.findFirst({ where: { id, tenantId } });
    if (!a) throw new NotFoundException('Announcement not found');
    await this.prisma.announcement.delete({ where: { id } });
    return { success: true };
  }

  // ── Departments ────────────────────────────────────────────────────────────
  async listDepartments(tenantId: string, schoolId: string) {
    const sid = await this.resolveSchoolId(tenantId, schoolId);
    return this.prisma.department.findMany({ where: { tenantId, ...(sid && { schoolId: sid }) }, orderBy: { name: 'asc' } });
  }
}
