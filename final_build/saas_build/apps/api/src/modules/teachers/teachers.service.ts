/**
 * Teachers service — teacher hiring, scheduling, and leave management.
 * create(): onboards teacher with subject assignments and class sections
 * findAll(): paginated teacher list with search
 * getTeacherSchedule(): returns timetable for a specific teacher
 * requestLeave(): submit leave application
 * approveLeave(): SCHOOL_ADMIN approves/rejects leave requests
 */

import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { PlanGuard } from '../../common/guards/plan.guard';
import { AuthService } from '../auth/auth.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { parseSpreadsheet, buildTemplate, buildExport, cleanCell, ImportResult, RowError } from '../../common/import/xlsx-import.util';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Generates a random, human-typeable temp password (no ambiguous chars: 0/O, 1/l/I). */
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 10; i++) out += chars[crypto.randomInt(chars.length)];
  return out;
}

@Injectable()
export class TeachersService {
  private readonly logger = new Logger(TeachersService.name);
  constructor(private prisma: PrismaService, private audit: AuditService, private planGuard: PlanGuard, private authService: AuthService) {}

  private async resolveSchoolId(tenantId: string, schoolId?: string): Promise<string | undefined> {
    if (schoolId && UUID_RE.test(schoolId)) return schoolId;
    const school = await this.prisma.school.findFirst({ where: { tenantId }, orderBy: { createdAt: 'asc' }, select: { id: true } });
    return school?.id;
  }

  async create(dto: CreateTeacherDto, tenantId: string, schoolId: string | undefined, createdById: string) {
    const resolvedSchoolId = await this.resolveSchoolId(tenantId, schoolId);
    if (!resolvedSchoolId) throw new Error('School not found for this tenant');
    schoolId = resolvedSchoolId;
    await this.planGuard.assertTeacherLimit(tenantId);
    const existing = await this.prisma.user.findFirst({ where: { tenantId, email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const tempPassword = generateTempPassword();
    const passwordHash = await this.authService.hashPassword(tempPassword);

    const { teacher, tenantSlug } = await this.prisma.$transaction(async tx => {
      const user = await tx.user.create({ data: { tenantId, email: dto.email, passwordHash, role: 'TEACHER', profile: { create: { firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone, gender: dto.gender as any } } } });
      const teacher = await tx.teacher.create({ data: { userId: user.id, tenantId, schoolId, employeeId: dto.employeeId, departmentId: dto.departmentId, qualifications: dto.qualifications ?? [], specializations: dto.specializations ?? [], joiningDate: new Date(dto.joiningDate) } });
      await tx.outboxEvent.create({ data: { tenantId, topic: 'teacher.created', key: teacher.id, payload: { teacherId: teacher.id }, headers: {} } });
      const tenant = await tx.tenant.findUnique({ where: { id: tenantId }, select: { slug: true } });
      return { teacher, tenantSlug: tenant?.slug ?? '' };
    });

    this.logger.log(`Teacher ${teacher.id} onboarded with auto-generated credentials (${dto.email})`);

    return {
      ...teacher,
      credentials: {
        username: dto.email,
        tempPassword,
        portalLoginUrl: `/t/${tenantSlug}/login`,
      },
    };
  }

  async findAll(tenantId: string, schoolId: string, page = 1, limit = 20, search?: string) {
    const resolvedSchoolId = await this.resolveSchoolId(tenantId, schoolId);
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {
      tenantId,
      ...(resolvedSchoolId && { schoolId: resolvedSchoolId }),
      isActive: true,
      ...(search && { user: { profile: { OR: [{ firstName: { contains: search, mode: 'insensitive' } }, { lastName: { contains: search, mode: 'insensitive' } }] } } }),
    };
    const [data, total] = await Promise.all([
      this.prisma.teacher.findMany({ where, include: { user: { include: { profile: true } }, department: true }, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
      this.prisma.teacher.count({ where }),
    ]);
    return { data, meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
  }

  async findByUserId(userId: string, tenantId: string) {
    return this.prisma.teacher.findFirst({
      where: { userId, tenantId },
      include: { user: { include: { profile: true } }, department: true },
    });
  }

  async findOne(id: string, tenantId: string) {
    const t = await this.prisma.teacher.findFirst({ where: { id, tenantId }, include: { user: { include: { profile: true } }, department: true } });
    if (!t) throw new NotFoundException('Teacher not found');
    return t;
  }

  async getTeacherSchedule(teacherId: string, tenantId: string) {
    return this.prisma.timetableSlot.findMany({ where: { teacherId, tenantId }, include: { section: { include: { class: true } }, classSubject: { include: { subject: true } } }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] });
  }

  async requestLeave(teacherId: string, tenantId: string, dto: any) {
    return this.prisma.leaveRequest.create({ data: { teacherId, tenantId: tenantId as any, leaveType: dto.leaveType, startDate: new Date(dto.startDate), endDate: new Date(dto.endDate), reason: dto.reason } });
  }

  async approveLeave(leaveId: string, tenantId: string, approverId: string) {
    return this.prisma.leaveRequest.update({ where: { id: leaveId }, data: { status: 'APPROVED', approvedBy: approverId, approvedAt: new Date() } });
  }

  async myLeaveRequests(userId: string, tenantId: string) {
    const teacher = await this.findByUserId(userId, tenantId);
    if (!teacher) return [];
    return this.prisma.leaveRequest.findMany({
      where: { teacherId: teacher.id, tenantId },
      orderBy: { startDate: 'desc' },
    });
  }

  async requestMyLeave(userId: string, tenantId: string, dto: any) {
    const teacher = await this.findByUserId(userId, tenantId);
    if (!teacher) throw new NotFoundException('Teacher profile not found for current user');
    return this.requestLeave(teacher.id, tenantId, dto);
  }

  // ── Deactivate ───────────────────────────────────────────────────────────

  async deactivate(id: string, tenantId: string, deactivatedById: string): Promise<void> {
    const teacher = await this.findOne(id, tenantId);
    await this.prisma.teacher.update({ where: { id }, data: { isActive: false } });
    await this.audit.log({ tenantId, userId: deactivatedById, action: 'DELETE', entity: 'Teacher', entityId: id, before: { employeeId: teacher.employeeId } });
    this.logger.log(`Teacher ${id} deactivated by ${deactivatedById}`);
  }

  // ── Bulk import / export ────────────────────────────────────────────────

  private readonly IMPORT_HEADERS = ['First Name', 'Last Name', 'Email', 'Employee ID', 'Joining Date (YYYY-MM-DD)', 'Phone', 'Gender (MALE/FEMALE/OTHER)', 'Department'];

  getImportTemplate(): Buffer {
    return buildTemplate(this.IMPORT_HEADERS, {
      'First Name': 'Fatima', 'Last Name': 'Malik', 'Email': 'fatima.malik@example.com',
      'Employee ID': 'EMP-001', 'Joining Date (YYYY-MM-DD)': '2026-04-01',
      'Phone': '0300-0000000', 'Gender (MALE/FEMALE/OTHER)': 'FEMALE', 'Department': 'Science',
    });
  }

  async bulkImport(buffer: Buffer, tenantId: string, schoolId: string | undefined, createdById: string): Promise<ImportResult<any>> {
    const resolvedSchoolId = await this.resolveSchoolId(tenantId, schoolId);
    if (!resolvedSchoolId) throw new Error('School not found for this tenant');

    const rows = parseSpreadsheet(buffer);
    if (rows.length === 0) throw new ConflictException('No rows found in the uploaded file. Please use the provided template.');
    if (rows.length > 1000) throw new ConflictException('Import limited to 1000 rows per file. Please split into smaller batches.');

    const limits = await this.planGuard.getLimits(tenantId);
    if (limits.maxTeachers !== -1) {
      const currentCount = await this.prisma.teacher.count({ where: { tenantId, isActive: true } });
      if (currentCount + rows.length > limits.maxTeachers) {
        throw new ConflictException(`This import would exceed your plan's teacher limit (${currentCount}/${limits.maxTeachers}, trying to add ${rows.length}). Please upgrade your plan or reduce the file size.`);
      }
    }

    const departments = await this.prisma.department.findMany({ where: { tenantId, schoolId: resolvedSchoolId } });
    const deptMap = new Map(departments.map(d => [d.name.toLowerCase(), d.id]));

    const existingEmails = new Set((await this.prisma.user.findMany({ where: { tenantId }, select: { email: true } })).map(u => u.email.toLowerCase()));
    const existingEmployeeIds = new Set((await this.prisma.teacher.findMany({ where: { tenantId }, select: { employeeId: true } })).map(e => e.employeeId));

    const created: any[] = [];
    const errors: RowError[] = [];
    const seenEmails = new Set<string>();
    const seenEmployeeIds = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2;
      const row = rows[i];
      try {
        const firstName = cleanCell(row['First Name']);
        const lastName = cleanCell(row['Last Name']);
        const email = cleanCell(row['Email'])?.toLowerCase();
        const employeeId = cleanCell(row['Employee ID']);
        const joiningDateRaw = cleanCell(row['Joining Date (YYYY-MM-DD)']) ?? cleanCell(row['Joining Date']);
        const phone = cleanCell(row['Phone']);
        const genderRaw = cleanCell(row['Gender (MALE/FEMALE/OTHER)']) ?? cleanCell(row['Gender']);
        const deptName = cleanCell(row['Department']);

        const missing: string[] = [];
        if (!firstName) missing.push('First Name');
        if (!lastName) missing.push('Last Name');
        if (!email) missing.push('Email');
        if (!employeeId) missing.push('Employee ID');
        if (!joiningDateRaw) missing.push('Joining Date');
        if (missing.length) { errors.push({ row: rowNum, message: `Missing required field(s): ${missing.join(', ')}` }); continue; }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email!)) { errors.push({ row: rowNum, message: `Invalid email: ${email}` }); continue; }
        if (existingEmails.has(email!) || seenEmails.has(email!)) { errors.push({ row: rowNum, message: `Email already used: ${email}` }); continue; }
        if (existingEmployeeIds.has(employeeId!) || seenEmployeeIds.has(employeeId!)) { errors.push({ row: rowNum, message: `Employee ID already used: ${employeeId}` }); continue; }

        const joiningDate = new Date(joiningDateRaw!);
        if (isNaN(joiningDate.getTime())) { errors.push({ row: rowNum, message: `Invalid Joining Date: ${joiningDateRaw}` }); continue; }

        let gender: string | undefined;
        if (genderRaw) {
          const g = genderRaw.toUpperCase();
          if (!['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'].includes(g)) { errors.push({ row: rowNum, message: `Invalid Gender: ${genderRaw} (use MALE/FEMALE/OTHER)` }); continue; }
          gender = g;
        }

        let departmentId: string | undefined;
        if (deptName) {
          departmentId = deptMap.get(deptName.toLowerCase());
          if (!departmentId) { errors.push({ row: rowNum, message: `No department found matching "${deptName}"` }); continue; }
        }

        const teacher = await this.prisma.$transaction(async tx => {
          const tempPassword = generateTempPassword();
          const passwordHash = await this.authService.hashPassword(tempPassword);
          const user = await tx.user.create({ data: { tenantId, email: email!, passwordHash, role: 'TEACHER', profile: { create: { firstName, lastName, phone, gender: gender as any } } } });
          const t = await tx.teacher.create({ data: { userId: user.id, tenantId, schoolId: resolvedSchoolId, employeeId: employeeId!, departmentId, joiningDate } });
          return { ...t, credentials: { username: email!, tempPassword } };
        });

        existingEmails.add(email!); seenEmails.add(email!);
        existingEmployeeIds.add(employeeId!); seenEmployeeIds.add(employeeId!);
        created.push(teacher);
      } catch (err: any) {
        errors.push({ row: rowNum, message: err?.message ?? 'Unknown error' });
      }
    }

    if (created.length > 0) {
      await this.audit.log({ tenantId, userId: createdById, action: 'CREATE', entity: 'Teacher', entityId: 'bulk-import', after: { count: created.length, source: 'bulk-import' } });
    }

    return { successCount: created.length, failedCount: errors.length, created, errors };
  }

  async exportToExcel(tenantId: string, schoolId: string | undefined): Promise<Buffer> {
    const resolvedSchoolId = await this.resolveSchoolId(tenantId, schoolId);
    const teachers = await this.prisma.teacher.findMany({
      where: { tenantId, ...(resolvedSchoolId && { schoolId: resolvedSchoolId }), isActive: true },
      include: { user: { include: { profile: true } }, department: true },
      orderBy: { createdAt: 'desc' },
    });
    const rows = teachers.map(t => ({
      'First Name': t.user.profile?.firstName ?? '',
      'Last Name': t.user.profile?.lastName ?? '',
      'Email': t.user.email,
      'Employee ID': t.employeeId,
      'Joining Date': t.joiningDate.toISOString().slice(0, 10),
      'Phone': t.user.profile?.phone ?? '',
      'Gender': t.user.profile?.gender ?? '',
      'Department': t.department?.name ?? '',
      'Status': t.isActive ? 'Active' : 'Inactive',
    }));
    return buildExport(rows, 'Teachers');
  }
}
