/**
 * Students service — full student lifecycle management.
 * create(): enrolls student, creates user account, checks plan limits
 * findAll(): paginated list with search, class/section filters
 * findOne(): single student with enrollments, attendance summary, fee status
 * update(): update personal info, contact details
 * deactivate(): soft-delete (sets isActive=false, deletedAt)
 * erasePersonalData(): GDPR/PDPA right-to-erasure — anonymizes PII
 */

import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { EventPublisher } from '../../events/event-publisher.service';
import { PlanGuard } from '../../common/guards/plan.guard';
import { AuthService } from '../auth/auth.service';
import { parseSpreadsheet, buildTemplate, buildExport, cleanCell, ImportResult, RowError } from '../../common/import/xlsx-import.util';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentListQueryDto } from './dto/student-list-query.dto';
import { PaginatedResult } from '../../common/types/pagination.types';
import { Prisma, Student } from '@prisma/client';
import * as crypto from 'crypto';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Generates a random, human-typeable temp password (no ambiguous chars: 0/O, 1/l/I). */
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 10; i++) out += chars[crypto.randomInt(chars.length)];
  return out;
}

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  private async resolveSchoolId(tenantId: string, schoolId?: string): Promise<string | undefined> {
    if (schoolId && UUID_RE.test(schoolId)) return schoolId;
    const school = await this.prisma.school.findFirst({ where: { tenantId }, orderBy: { createdAt: 'asc' }, select: { id: true } });
    return school?.id;
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly events: EventPublisher,
    private readonly planGuard: PlanGuard,
    private readonly authService: AuthService,
  ) {}

  async create(
    dto: CreateStudentDto,
    tenantId: string,
    schoolId: string | undefined,
    createdById: string,
  ): Promise<any> {
    if (!schoolId) {
      const school = await this.prisma.school.findFirst({ where: { tenantId }, orderBy: { createdAt: 'asc' } });
      if (!school) throw new Error('School not found for this tenant');
      schoolId = school.id;
    }
    // Enforce plan limits
    await this.planGuard.assertStudentLimit(tenantId);

    // Check duplicate admission number
    const existing = await this.prisma.student.findFirst({
      where: { tenantId, admissionNo: dto.admissionNo },
    });

    if (existing) {
      throw new ConflictException(`Admission number ${dto.admissionNo} already exists`);
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await this.authService.hashPassword(tempPassword);

    const student = await this.prisma.$transaction(async (tx) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          tenantId,
          email: dto.email,
          passwordHash,
          role: 'STUDENT',
          profile: {
            create: {
              firstName: dto.firstName,
              lastName: dto.lastName,
              dateOfBirth: dto.dateOfBirth,
              gender: dto.gender,
              phone: dto.phone,
            },
          },
        },
      });

      // Create student record
      const student = await tx.student.create({
        data: {
          userId: user.id,
          tenantId,
          schoolId,
          rollNumber: dto.rollNumber,
          admissionNo: dto.admissionNo,
          admissionDate: new Date(dto.admissionDate),
          bloodGroup: dto.bloodGroup,
          transportId: dto.transportId,
          hostelId: dto.hostelId,
        },
      });

      // Enroll in section if provided
      if (dto.sectionId) {
        await tx.studentEnrollment.create({
          data: {
            studentId: student.id,
            sectionId: dto.sectionId,
            tenantId,
            academicYear: dto.academicYear,
          },
        });
      }

      // Emit outbox event (reliable event delivery via DB transaction)
      await tx.outboxEvent.create({
        data: {
          tenantId,
          topic: 'student.enrolled',
          key: student.id,
          payload: {
            studentId: student.id,
            schoolId,
            sectionId: dto.sectionId,
            academicYear: dto.academicYear,
          },
          headers: { correlationId: createdById },
        },
      });

      return student;
    });

    await this.audit.log({
      tenantId,
      userId: createdById,
      action: 'CREATE',
      entity: 'Student',
      entityId: student.id,
      after: { admissionNo: dto.admissionNo, schoolId },
    });

    this.logger.log(`Student created: ${student.id} in tenant ${tenantId}`);
    return {
      ...student,
      credentials: { username: dto.email, tempPassword },
    };
  }

  async findAll(
    tenantId: string,
    schoolId: string,
    query: StudentListQueryDto,
  ): Promise<PaginatedResult<Student>> {
    const resolvedSchoolId = await this.resolveSchoolId(tenantId, schoolId);
    const { page = 1, limit = 20, search, classId, sectionId, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      ...(resolvedSchoolId && { schoolId: resolvedSchoolId }),
      ...(isActive !== undefined && { isActive }),
      ...(sectionId && {
        enrollments: {
          some: { sectionId, isActive: true },
        },
      }),
      ...(classId && {
        enrollments: {
          some: {
            section: { classId },
            isActive: true,
          },
        },
      }),
      ...(search && {
        OR: [
          { rollNumber: { contains: search, mode: 'insensitive' } },
          { admissionNo: { contains: search, mode: 'insensitive' } },
          {
            user: {
              profile: {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        include: {
          user: { include: { profile: true } },
          enrollments: {
            where: { isActive: true },
            include: { section: { include: { class: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findByUserId(userId: string, tenantId: string): Promise<Student | null> {
    return this.prisma.student.findFirst({
      where: { userId, tenantId },
      include: {
        user: { include: { profile: true } },
        enrollments: {
          where: { isActive: true },
          include: { section: { include: { class: true } } },
        },
      },
    });
  }

  async findOne(id: string, tenantId: string): Promise<any> {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId },
      include: {
        user: { include: { profile: true } },
        enrollments: {
          where: { isActive: true },
          include: { section: { include: { class: true } } },
        },
        parents: { include: { parent: { include: { user: { include: { profile: true } } } } } },
        documents: { orderBy: { generatedAt: 'desc' }, take: 10 },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student ${id} not found`);
    }

    return student;
  }

  async update(
    id: string,
    dto: UpdateStudentDto,
    tenantId: string,
    updatedById: string,
  ): Promise<any> {
    const existing = await this.findOne(id, tenantId);

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.firstName || dto.lastName || dto.phone || dto.gender) {
        await tx.userProfile.update({
          where: { userId: existing.userId },
          data: {
            ...(dto.firstName && { firstName: dto.firstName }),
            ...(dto.lastName && { lastName: dto.lastName }),
            ...(dto.phone && { phone: dto.phone }),
            ...(dto.gender && { gender: dto.gender }),
          },
        });
      }

      return tx.student.update({
        where: { id },
        data: {
          ...(dto.bloodGroup && { bloodGroup: dto.bloodGroup }),
          ...(dto.transportId !== undefined && { transportId: dto.transportId }),
          ...(dto.hostelId !== undefined && { hostelId: dto.hostelId }),
          ...(dto.medicalNotes && { medicalNotes: dto.medicalNotes }),
        },
      });
    });

    await this.audit.log({
      tenantId,
      userId: updatedById,
      action: 'UPDATE',
      entity: 'Student',
      entityId: id,
      before: { bloodGroup: existing.bloodGroup },
      after: { bloodGroup: dto.bloodGroup },
    });

    return updated;
  }

  async deactivate(id: string, tenantId: string, deactivatedById: string): Promise<void> {
    const student = await this.findOne(id, tenantId);

    await this.prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id },
        data: { isActive: false },
      });

      await tx.studentEnrollment.updateMany({
        where: { studentId: id },
        data: { isActive: false, leftAt: new Date() },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          topic: 'student.deactivated',
          key: id,
          payload: { studentId: id, schoolId: student.schoolId },
          headers: {},
        },
      });
    });

    await this.audit.log({
      tenantId,
      userId: deactivatedById,
      action: 'UPDATE',
      entity: 'Student',
      entityId: id,
      after: { isActive: false },
    });
  }

  /**
   * GDPR: Right to erasure — anonymize PII, retain academic records
   */
  async erasePersonalData(id: string, tenantId: string, requestedById: string): Promise<void> {
    const student = await this.findOne(id, tenantId);

    await this.prisma.$transaction(async (tx) => {
      // Anonymize PII fields, retain academic records for legal compliance
      await tx.userProfile.update({
        where: { userId: student.userId },
        data: {
          firstName: '[ERASED]',
          lastName: '[ERASED]',
          dateOfBirth: null,
          phone: null,
          address: null as any,
          nationalId: null,
          photoUrl: null,
        },
      });

      await tx.user.update({
        where: { id: student.userId },
        data: {
          email: `erased-${student.userId}@erased.invalid`,
          passwordHash: null,
          isActive: false,
        },
      });

      await tx.student.update({
        where: { id },
        data: { medicalNotes: null, biometricId: null },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          topic: 'gdpr.erasure.completed',
          key: id,
          payload: { studentId: id, requestedById, completedAt: new Date().toISOString() },
          headers: {},
        },
      });
    });

    await this.audit.log({
      tenantId,
      userId: requestedById,
      action: 'DELETE',
      entity: 'Student',
      entityId: id,
      after: { action: 'GDPR_ERASURE' },
    });

    this.logger.log(`GDPR erasure completed for student ${id}`);
  }

  // ── Bulk import / export ────────────────────────────────────────────────

  private readonly IMPORT_HEADERS = [
    'First Name', 'Last Name', 'Email', 'Admission No', 'Roll Number',
    'Admission Date (YYYY-MM-DD)', 'Date of Birth (YYYY-MM-DD)', 'Gender (MALE/FEMALE/OTHER)',
    'Phone', 'Class', 'Section', 'Academic Year',
  ];

  getImportTemplate(): Buffer {
    return buildTemplate(this.IMPORT_HEADERS, {
      'First Name': 'Ali', 'Last Name': 'Raza', 'Email': 'ali.raza@example.com',
      'Admission No': 'ADM-2026-001', 'Roll Number': '01',
      'Admission Date (YYYY-MM-DD)': '2026-04-01', 'Date of Birth (YYYY-MM-DD)': '2012-03-15',
      'Gender (MALE/FEMALE/OTHER)': 'MALE', 'Phone': '0300-0000000',
      'Class': '10', 'Section': 'A', 'Academic Year': '2026-2027',
    });
  }

  async bulkImport(buffer: Buffer, tenantId: string, schoolId: string | undefined, createdById: string): Promise<ImportResult<any>> {
    if (!schoolId) {
      const school = await this.prisma.school.findFirst({ where: { tenantId }, orderBy: { createdAt: 'asc' } });
      if (!school) throw new Error('School not found for this tenant');
      schoolId = school.id;
    }

    const rows = parseSpreadsheet(buffer);
    if (rows.length === 0) throw new ConflictException('No rows found in the uploaded file. Please use the provided template.');
    if (rows.length > 1000) throw new ConflictException('Import limited to 1000 rows per file. Please split into smaller batches.');

    // Check plan capacity up front rather than failing midway through
    const limits = await this.planGuard.getLimits(tenantId);
    if (limits.maxStudents !== -1) {
      const currentCount = await this.prisma.student.count({ where: { tenantId, isActive: true } });
      if (currentCount + rows.length > limits.maxStudents) {
        throw new ConflictException(`This import would exceed your plan's student limit (${currentCount}/${limits.maxStudents}, trying to add ${rows.length}). Please upgrade your plan or reduce the file size.`);
      }
    }

    // Pre-load sections for this school so we can resolve "Class"+"Section" names without a query per row
    const sections = await this.prisma.section.findMany({
      where: { tenantId, schoolId, class: { isActive: true } },
      include: { class: true },
    });
    const sectionMap = new Map(sections.map(s => [`${s.class.name.toLowerCase()}|${s.name.toLowerCase()}`, s.id]));

    const existingEmails = new Set((await this.prisma.user.findMany({ where: { tenantId }, select: { email: true } })).map(u => u.email.toLowerCase()));
    const existingAdmissionNos = new Set((await this.prisma.student.findMany({ where: { tenantId }, select: { admissionNo: true } })).map(a => a.admissionNo));

    const created: any[] = [];
    const errors: RowError[] = [];
    const seenEmailsInFile = new Set<string>();
    const seenAdmissionNosInFile = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2; // +1 for 0-index, +1 for header row
      const row = rows[i];
      try {
        const firstName = cleanCell(row['First Name']);
        const lastName = cleanCell(row['Last Name']);
        const email = cleanCell(row['Email'])?.toLowerCase();
        const admissionNo = cleanCell(row['Admission No']);
        const rollNumber = cleanCell(row['Roll Number']);
        const admissionDateRaw = cleanCell(row['Admission Date (YYYY-MM-DD)']) ?? cleanCell(row['Admission Date']);
        const dobRaw = cleanCell(row['Date of Birth (YYYY-MM-DD)']) ?? cleanCell(row['Date of Birth']);
        const genderRaw = cleanCell(row['Gender (MALE/FEMALE/OTHER)']) ?? cleanCell(row['Gender']);
        const phone = cleanCell(row['Phone']);
        const className = cleanCell(row['Class']);
        const sectionName = cleanCell(row['Section']);
        const academicYear = cleanCell(row['Academic Year']);

        const missing: string[] = [];
        if (!firstName) missing.push('First Name');
        if (!lastName) missing.push('Last Name');
        if (!email) missing.push('Email');
        if (!admissionNo) missing.push('Admission No');
        if (!rollNumber) missing.push('Roll Number');
        if (!admissionDateRaw) missing.push('Admission Date');
        if (missing.length) { errors.push({ row: rowNum, message: `Missing required field(s): ${missing.join(', ')}` }); continue; }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errors.push({ row: rowNum, message: `Invalid email: ${email}` }); continue; }
        if (existingEmails.has(email!) || seenEmailsInFile.has(email!)) { errors.push({ row: rowNum, message: `Email already used: ${email}` }); continue; }
        if (existingAdmissionNos.has(admissionNo!) || seenAdmissionNosInFile.has(admissionNo!)) { errors.push({ row: rowNum, message: `Admission No already used: ${admissionNo}` }); continue; }

        const admissionDate = new Date(admissionDateRaw!);
        if (isNaN(admissionDate.getTime())) { errors.push({ row: rowNum, message: `Invalid Admission Date: ${admissionDateRaw}` }); continue; }
        let dateOfBirth: Date | undefined;
        if (dobRaw) {
          dateOfBirth = new Date(dobRaw);
          if (isNaN(dateOfBirth.getTime())) { errors.push({ row: rowNum, message: `Invalid Date of Birth: ${dobRaw}` }); continue; }
        }
        let gender: string | undefined;
        if (genderRaw) {
          const g = genderRaw.toUpperCase();
          if (!['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'].includes(g)) { errors.push({ row: rowNum, message: `Invalid Gender: ${genderRaw} (use MALE/FEMALE/OTHER)` }); continue; }
          gender = g;
        }

        let sectionId: string | undefined;
        if (className && sectionName) {
          sectionId = sectionMap.get(`${className.toLowerCase()}|${sectionName.toLowerCase()}`);
          if (!sectionId) { errors.push({ row: rowNum, message: `No section found matching Class "${className}" + Section "${sectionName}"` }); continue; }
        }

        const student = await this.prisma.$transaction(async tx => {
          const tempPassword = generateTempPassword();
          const passwordHash = await this.authService.hashPassword(tempPassword);
          const user = await tx.user.create({
            data: { tenantId, email: email!, passwordHash, role: 'STUDENT', profile: { create: { firstName, lastName, dateOfBirth, gender: gender as any, phone } } },
          });
          const s = await tx.student.create({
            data: { userId: user.id, tenantId, schoolId: schoolId!, rollNumber: rollNumber!, admissionNo: admissionNo!, admissionDate },
          });
          if (sectionId) {
            await tx.studentEnrollment.create({ data: { studentId: s.id, sectionId, tenantId, academicYear: academicYear ?? new Date().getFullYear().toString() } });
          }
          return { ...s, credentials: { username: email!, tempPassword } };
        });

        existingEmails.add(email!);
        existingAdmissionNos.add(admissionNo!);
        seenEmailsInFile.add(email!);
        seenAdmissionNosInFile.add(admissionNo!);
        created.push(student);
      } catch (err: any) {
        errors.push({ row: rowNum, message: err?.message ?? 'Unknown error' });
      }
    }

    if (created.length > 0) {
      await this.audit.log({ tenantId, userId: createdById, action: 'CREATE', entity: 'Student', entityId: 'bulk-import', after: { count: created.length, source: 'bulk-import' } });
    }

    return { successCount: created.length, failedCount: errors.length, created, errors };
  }

  async exportToExcel(tenantId: string, schoolId: string | undefined): Promise<Buffer> {
    if (!schoolId) {
      const school = await this.prisma.school.findFirst({ where: { tenantId }, orderBy: { createdAt: 'asc' } });
      schoolId = school?.id;
    }
    const students = await this.prisma.student.findMany({
      where: { tenantId, ...(schoolId && { schoolId }), isActive: true },
      include: { user: { include: { profile: true } }, enrollments: { where: { isActive: true }, include: { section: { include: { class: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    const rows = students.map(s => ({
      'First Name': s.user.profile?.firstName ?? '',
      'Last Name': s.user.profile?.lastName ?? '',
      'Email': s.user.email,
      'Admission No': s.admissionNo,
      'Roll Number': s.rollNumber,
      'Admission Date': s.admissionDate.toISOString().slice(0, 10),
      'Gender': s.user.profile?.gender ?? '',
      'Phone': s.user.profile?.phone ?? '',
      'Class': s.enrollments[0]?.section?.class?.name ?? '',
      'Section': s.enrollments[0]?.section?.name ?? '',
      'Status': s.isActive ? 'Active' : 'Inactive',
    }));
    return buildExport(rows, 'Students');
  }
}
