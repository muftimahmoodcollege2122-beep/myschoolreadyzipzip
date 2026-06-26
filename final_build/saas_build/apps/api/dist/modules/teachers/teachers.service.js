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
var TeachersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../../common/audit/audit.service");
const plan_guard_1 = require("../../common/guards/plan.guard");
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let TeachersService = TeachersService_1 = class TeachersService {
    constructor(prisma, audit, planGuard) {
        this.prisma = prisma;
        this.audit = audit;
        this.planGuard = planGuard;
        this.logger = new common_1.Logger(TeachersService_1.name);
    }
    async resolveSchoolId(tenantId, schoolId) {
        if (schoolId && UUID_RE.test(schoolId))
            return schoolId;
        const school = await this.prisma.school.findFirst({ where: { tenantId }, select: { id: true } });
        return school?.id;
    }
    async create(dto, tenantId, schoolId, createdById) {
        const resolvedSchoolId = await this.resolveSchoolId(tenantId, schoolId);
        if (!resolvedSchoolId)
            throw new Error('School not found for this tenant');
        schoolId = resolvedSchoolId;
        await this.planGuard.assertTeacherLimit(tenantId);
        const existing = await this.prisma.user.findFirst({ where: { tenantId, email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({ data: { tenantId, email: dto.email, role: 'TEACHER', profile: { create: { firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone, gender: dto.gender } } } });
            const teacher = await tx.teacher.create({ data: { userId: user.id, tenantId, schoolId, employeeId: dto.employeeId, departmentId: dto.departmentId, qualifications: dto.qualifications ?? [], specializations: dto.specializations ?? [], joiningDate: new Date(dto.joiningDate) } });
            await tx.outboxEvent.create({ data: { tenantId, topic: 'teacher.created', key: teacher.id, payload: { teacherId: teacher.id }, headers: {} } });
            return teacher;
        });
    }
    async findAll(tenantId, schoolId, page = 1, limit = 20, search) {
        const resolvedSchoolId = await this.resolveSchoolId(tenantId, schoolId);
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
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
    async findByUserId(userId, tenantId) {
        return this.prisma.teacher.findFirst({
            where: { userId, tenantId },
            include: { user: { include: { profile: true } }, department: true },
        });
    }
    async findOne(id, tenantId) {
        const t = await this.prisma.teacher.findFirst({ where: { id, tenantId }, include: { user: { include: { profile: true } }, department: true } });
        if (!t)
            throw new common_1.NotFoundException('Teacher not found');
        return t;
    }
    async getTeacherSchedule(teacherId, tenantId) {
        return this.prisma.timetableSlot.findMany({ where: { teacherId, tenantId }, include: { section: { include: { class: true } }, classSubject: { include: { subject: true } } }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] });
    }
    async requestLeave(teacherId, tenantId, dto) {
        return this.prisma.leaveRequest.create({ data: { teacherId, tenantId: tenantId, leaveType: dto.leaveType, startDate: new Date(dto.startDate), endDate: new Date(dto.endDate), reason: dto.reason } });
    }
    async approveLeave(leaveId, tenantId, approverId) {
        return this.prisma.leaveRequest.update({ where: { id: leaveId }, data: { status: 'APPROVED', approvedBy: approverId, approvedAt: new Date() } });
    }
};
exports.TeachersService = TeachersService;
exports.TeachersService = TeachersService = TeachersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService, plan_guard_1.PlanGuard])
], TeachersService);
//# sourceMappingURL=teachers.service.js.map