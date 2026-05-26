import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { PlanGuard } from '../../common/guards/plan.guard';
import { CreateTeacherDto } from './dto/create-teacher.dto';

@Injectable()
export class TeachersService {
  private readonly logger = new Logger(TeachersService.name);
  constructor(private prisma: PrismaService, private audit: AuditService, private planGuard: PlanGuard) {}

  async create(dto: CreateTeacherDto, tenantId: string, schoolId: string, createdById: string) {
    await this.planGuard.assertTeacherLimit(tenantId);
    const existing = await this.prisma.user.findFirst({ where: { tenantId, email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');
    return this.prisma.$transaction(async tx => {
      const user = await tx.user.create({ data: { tenantId, email: dto.email, role: 'TEACHER', profile: { create: { firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone, gender: dto.gender as any } } } });
      const teacher = await tx.teacher.create({ data: { userId: user.id, tenantId, schoolId, employeeId: dto.employeeId, departmentId: dto.departmentId, qualifications: dto.qualifications ?? [], specializations: dto.specializations ?? [], joiningDate: new Date(dto.joiningDate) } });
      await tx.outboxEvent.create({ data: { tenantId, topic: 'teacher.created', key: teacher.id, payload: { teacherId: teacher.id }, headers: {} } });
      return teacher;
    });
  }

  async findAll(tenantId: string, schoolId: string, page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId, schoolId, isActive: true, ...(search && { user: { profile: { OR: [{ firstName: { contains: search, mode: 'insensitive' } }, { lastName: { contains: search, mode: 'insensitive' } }] } } }) };
    const [data, total] = await Promise.all([
      this.prisma.teacher.findMany({ where, include: { user: { include: { profile: true } }, department: true }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.teacher.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
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
}
