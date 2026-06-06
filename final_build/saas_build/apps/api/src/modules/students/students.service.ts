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
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentListQueryDto } from './dto/student-list-query.dto';
import { PaginatedResult } from '../../common/types/pagination.types';
import { Prisma, Student } from '@prisma/client';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  private async resolveSchoolId(tenantId: string, schoolId?: string): Promise<string | undefined> {
    if (schoolId && UUID_RE.test(schoolId)) return schoolId;
    const school = await this.prisma.school.findFirst({ where: { tenantId, isActive: true }, select: { id: true } });
    return school?.id;
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly events: EventPublisher,
    private readonly planGuard: PlanGuard,
  ) {}

  async create(
    dto: CreateStudentDto,
    tenantId: string,
    schoolId: string,
    createdById: string,
  ): Promise<Student> {
    // Enforce plan limits
    await this.planGuard.assertStudentLimit(tenantId);

    // Check duplicate admission number
    const existing = await this.prisma.student.findFirst({
      where: { tenantId, admissionNo: dto.admissionNo },
    });

    if (existing) {
      throw new ConflictException(`Admission number ${dto.admissionNo} already exists`);
    }

    const student = await this.prisma.$transaction(async (tx) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          tenantId,
          email: dto.email,
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
          admissionDate: dto.admissionDate,
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
    return student;
  }

  async findAll(
    tenantId: string,
    schoolId: string,
    query: StudentListQueryDto,
  ): Promise<PaginatedResult<Student>> {
    const resolvedSchoolId = await this.resolveSchoolId(tenantId, schoolId);
    const { page = 1, limit = 20, search, classId, sectionId, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = {
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

  async findOne(id: string, tenantId: string): Promise<Student> {
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
  ): Promise<Student> {
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
          address: Prisma.JsonNull,
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
}
