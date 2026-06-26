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
var SchoolDataService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolDataService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let SchoolDataService = SchoolDataService_1 = class SchoolDataService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SchoolDataService_1.name);
    }
    async resolveSchoolId(tenantId, sid) {
        if (sid && UUID_RE.test(sid))
            return sid;
        const s = await this.prisma.school.findFirst({ where: { tenantId }, select: { id: true } });
        return s?.id;
    }
    async getSchool(tenantId) {
        const s = await this.prisma.school.findFirst({ where: { tenantId } });
        if (!s)
            throw new common_1.NotFoundException('School not found');
        return s;
    }
    async getSection(tenantId, section) {
        const school = await this.prisma.school.findFirst({ where: { tenantId }, select: { settings: true } });
        if (!school)
            return [];
        const data = school.settings?.[section];
        return Array.isArray(data) ? data : [];
    }
    async createSectionItem(tenantId, section, dto) {
        const school = await this.getSchool(tenantId);
        const settings = school.settings || {};
        const items = Array.isArray(settings[section]) ? settings[section] : [];
        const newItem = { id: `${section.slice(0, 3)}${Date.now()}`, ...dto, createdAt: new Date().toISOString() };
        await this.prisma.school.update({ where: { id: school.id }, data: { settings: { ...settings, [section]: [...items, newItem] } } });
        return newItem;
    }
    async updateSectionItem(tenantId, section, itemId, dto) {
        const school = await this.getSchool(tenantId);
        const settings = school.settings || {};
        const items = Array.isArray(settings[section]) ? settings[section] : [];
        const idx = items.findIndex((i) => i.id === itemId);
        if (idx === -1)
            throw new common_1.NotFoundException('Item not found');
        items[idx] = { ...items[idx], ...dto };
        await this.prisma.school.update({ where: { id: school.id }, data: { settings: { ...settings, [section]: items } } });
        return items[idx];
    }
    async deleteSectionItem(tenantId, section, itemId) {
        const school = await this.getSchool(tenantId);
        const settings = school.settings || {};
        const items = (Array.isArray(settings[section]) ? settings[section] : []).filter((i) => i.id !== itemId);
        await this.prisma.school.update({ where: { id: school.id }, data: { settings: { ...settings, [section]: items } } });
        return { success: true };
    }
    async listClasses(tenantId, schoolId) {
        const sid = await this.resolveSchoolId(tenantId, schoolId);
        return this.prisma.class.findMany({
            where: { tenantId, ...(sid && { schoolId: sid }), isActive: true },
            include: { sections: { orderBy: { name: 'asc' }, include: { _count: { select: { students: true } } } }, _count: { select: { sections: true } } },
            orderBy: { level: 'asc' },
        });
    }
    async createClass(tenantId, schoolId, dto) {
        const sid = await this.resolveSchoolId(tenantId, schoolId);
        return this.prisma.class.create({ data: { tenantId, schoolId: sid, name: dto.name, level: Number(dto.level), academicYear: dto.academicYear ?? '2025-2026' } });
    }
    async updateClass(tenantId, id, dto) {
        const c = await this.prisma.class.findFirst({ where: { id, tenantId } });
        if (!c)
            throw new common_1.NotFoundException('Class not found');
        return this.prisma.class.update({ where: { id }, data: { name: dto.name, isActive: dto.isActive } });
    }
    async listSections(tenantId, schoolId, classId) {
        const sid = await this.resolveSchoolId(tenantId, schoolId);
        return this.prisma.section.findMany({
            where: { tenantId, ...(sid && { schoolId: sid }), ...(classId && { classId }) },
            include: { class: true, _count: { select: { students: true } } },
            orderBy: [{ class: { level: 'asc' } }, { name: 'asc' }],
        });
    }
    async createSection(tenantId, schoolId, dto) {
        const sid = await this.resolveSchoolId(tenantId, schoolId);
        return this.prisma.section.create({ data: { tenantId, schoolId: sid, classId: dto.classId, name: dto.name, capacity: Number(dto.capacity ?? 40), roomNumber: dto.roomNumber } });
    }
    async listSubjects(tenantId, schoolId) {
        const sid = await this.resolveSchoolId(tenantId, schoolId);
        return this.prisma.subject.findMany({
            where: { tenantId, ...(sid && { schoolId: sid }) },
            include: { _count: { select: { classSubjects: true } } },
            orderBy: { name: 'asc' },
        });
    }
    async createSubject(tenantId, schoolId, dto) {
        const sid = await this.resolveSchoolId(tenantId, schoolId);
        return this.prisma.subject.create({ data: { tenantId, schoolId: sid, name: dto.name, code: dto.code, description: dto.description, isElective: dto.isElective ?? false, creditHours: Number(dto.creditHours ?? 1) } });
    }
    async listStaff(tenantId, schoolId, page = 1, limit = 20, search) {
        const sid = await this.resolveSchoolId(tenantId, schoolId);
        const where = { tenantId, ...(sid && { schoolId: sid }), isActive: true, ...(search && { OR: [{ designation: { contains: search, mode: 'insensitive' } }, { user: { profile: { OR: [{ firstName: { contains: search, mode: 'insensitive' } }, { lastName: { contains: search, mode: 'insensitive' } }] } } }] }) };
        const skip = (Number(page) - 1) * Number(limit);
        const [data, total] = await Promise.all([
            this.prisma.staff.findMany({ where, skip, take: Number(limit), include: { user: { include: { profile: true } } }, orderBy: { createdAt: 'desc' } }),
            this.prisma.staff.count({ where }),
        ]);
        return { data, meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
    }
    async createStaff(tenantId, schoolId, dto) {
        const sid = await this.resolveSchoolId(tenantId, schoolId);
        const existing = await this.prisma.user.findFirst({ where: { tenantId, email: dto.email } });
        if (existing) {
            return this.prisma.staff.create({ data: { tenantId, schoolId: sid, userId: existing.id, employeeId: dto.employeeId, designation: dto.designation, department: dto.department, joiningDate: new Date(dto.joiningDate), salary: dto.salary ? Number(dto.salary) : undefined } });
        }
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({ data: { tenantId, email: dto.email, role: 'TEACHER', profile: { create: { firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone } } } });
            return tx.staff.create({ data: { tenantId, schoolId: sid, userId: user.id, employeeId: dto.employeeId, designation: dto.designation, department: dto.department, joiningDate: new Date(dto.joiningDate), salary: dto.salary ? Number(dto.salary) : undefined } });
        });
    }
    async listEvents(tenantId, schoolId, upcoming = false) {
        const sid = await this.resolveSchoolId(tenantId, schoolId);
        const where = { tenantId, ...(sid && { schoolId: sid }), ...(upcoming && { startAt: { gte: new Date() } }) };
        return this.prisma.schoolEvent.findMany({ where, orderBy: { startAt: 'asc' }, take: 50 });
    }
    async createEvent(tenantId, schoolId, dto) {
        const sid = await this.resolveSchoolId(tenantId, schoolId);
        return this.prisma.schoolEvent.create({ data: { tenantId, schoolId: sid, title: dto.title, description: dto.description, startAt: new Date(dto.startAt), endAt: new Date(dto.endAt), venue: dto.venue, isPublic: dto.isPublic ?? false } });
    }
    async deleteEvent(tenantId, id) {
        const e = await this.prisma.schoolEvent.findFirst({ where: { id, tenantId } });
        if (!e)
            throw new common_1.NotFoundException('Event not found');
        await this.prisma.schoolEvent.delete({ where: { id } });
        return { success: true };
    }
    async getSchoolInfo(tenantId) {
        return this.prisma.school.findFirst({ where: { tenantId } });
    }
    async updateSchoolInfo(tenantId, dto) {
        const school = await this.getSchool(tenantId);
        const currentSettings = school.settings || {};
        const currentAddress = school.address || {};
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
    async getLmsData(tenantId) {
        const school = await this.prisma.school.findFirst({ where: { tenantId }, select: { settings: true } });
        if (!school)
            return { courses: [] };
        return { courses: (school.settings?.lms?.courses) || [] };
    }
    async createLmsCourse(tenantId, dto) {
        const school = await this.getSchool(tenantId);
        const settings = school.settings || {};
        const courses = settings.lms?.courses || [];
        const EMOJIS = ['📐', '⚛️', '📖', '✍️', '🧬', '💻', '🌍', '🎨', '🔬', '📊', '🎭', '📚'];
        const newCourse = { id: `c${Date.now()}`, title: dto.title, subject: dto.subject, description: dto.description || '', teacher: dto.teacher || '', status: 'DRAFT', lessons: 0, assignments: 0, students: 0, progress: 0, thumb: EMOJIS[courses.length % EMOJIS.length], createdAt: new Date().toISOString() };
        await this.prisma.school.update({ where: { id: school.id }, data: { settings: { ...settings, lms: { courses: [...courses, newCourse] } } } });
        return newCourse;
    }
    async updateLmsCourse(tenantId, courseId, dto) {
        const school = await this.getSchool(tenantId);
        const settings = school.settings || {};
        const courses = settings.lms?.courses || [];
        const idx = courses.findIndex((c) => c.id === courseId);
        if (idx === -1)
            throw new common_1.NotFoundException('Course not found');
        courses[idx] = { ...courses[idx], ...dto };
        await this.prisma.school.update({ where: { id: school.id }, data: { settings: { ...settings, lms: { courses } } } });
        return courses[idx];
    }
    async deleteLmsCourse(tenantId, courseId) {
        const school = await this.getSchool(tenantId);
        const settings = school.settings || {};
        const courses = (settings.lms?.courses || []).filter((c) => c.id !== courseId);
        await this.prisma.school.update({ where: { id: school.id }, data: { settings: { ...settings, lms: { courses } } } });
        return { success: true };
    }
    async getWebsiteSettings(tenantId) {
        const school = await this.prisma.school.findFirst({ where: { tenantId }, select: { settings: true } });
        if (!school)
            return {};
        return school.settings?.website || {};
    }
    async saveWebsiteSettings(tenantId, dto) {
        const school = await this.getSchool(tenantId);
        const settings = school.settings || {};
        await this.prisma.school.update({ where: { id: school.id }, data: { settings: { ...settings, website: dto } } });
        return { success: true, ...dto };
    }
    async getBackup(tenantId) {
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
    async listAnnouncements(tenantId, page = 1, limit = 20) {
        const skip = (Number(page) - 1) * Number(limit);
        const [data, total] = await Promise.all([
            this.prisma.announcement.findMany({ where: { tenantId }, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
            this.prisma.announcement.count({ where: { tenantId } }),
        ]);
        return { data, meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
    }
    async createAnnouncement(tenantId, createdById, dto) {
        const sid = await this.resolveSchoolId(tenantId);
        return this.prisma.announcement.create({ data: { tenantId, schoolId: sid, createdById, title: dto.title, body: dto.content ?? dto.body ?? '', targetRoles: dto.targetRoles ?? [], isPinned: dto.isPinned ?? false, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined } });
    }
    async deleteAnnouncement(tenantId, id) {
        const a = await this.prisma.announcement.findFirst({ where: { id, tenantId } });
        if (!a)
            throw new common_1.NotFoundException('Announcement not found');
        await this.prisma.announcement.delete({ where: { id } });
        return { success: true };
    }
    async listDepartments(tenantId, schoolId) {
        const sid = await this.resolveSchoolId(tenantId, schoolId);
        return this.prisma.department.findMany({ where: { tenantId, ...(sid && { schoolId: sid }) }, orderBy: { name: 'asc' } });
    }
};
exports.SchoolDataService = SchoolDataService;
exports.SchoolDataService = SchoolDataService = SchoolDataService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchoolDataService);
//# sourceMappingURL=school-data.service.js.map