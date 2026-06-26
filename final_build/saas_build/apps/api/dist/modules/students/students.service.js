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
var StudentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../../common/audit/audit.service");
const event_publisher_service_1 = require("../../events/event-publisher.service");
const plan_guard_1 = require("../../common/guards/plan.guard");
const client_1 = require("@prisma/client");
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let StudentsService = StudentsService_1 = class StudentsService {
    async resolveSchoolId(tenantId, schoolId) {
        if (schoolId && UUID_RE.test(schoolId))
            return schoolId;
        const school = await this.prisma.school.findFirst({ where: { tenantId }, select: { id: true } });
        return school?.id;
    }
    constructor(prisma, audit, events, planGuard) {
        this.prisma = prisma;
        this.audit = audit;
        this.events = events;
        this.planGuard = planGuard;
        this.logger = new common_1.Logger(StudentsService_1.name);
    }
    async create(dto, tenantId, schoolId, createdById) {
        if (!schoolId) {
            const school = await this.prisma.school.findFirst({ where: { tenantId } });
            if (!school)
                throw new Error('School not found for this tenant');
            schoolId = school.id;
        }
        await this.planGuard.assertStudentLimit(tenantId);
        const existing = await this.prisma.student.findFirst({
            where: { tenantId, admissionNo: dto.admissionNo },
        });
        if (existing) {
            throw new common_1.ConflictException(`Admission number ${dto.admissionNo} already exists`);
        }
        const student = await this.prisma.$transaction(async (tx) => {
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
    async findAll(tenantId, schoolId, query) {
        const resolvedSchoolId = await this.resolveSchoolId(tenantId, schoolId);
        const { page = 1, limit = 20, search, classId, sectionId, isActive } = query;
        const skip = (page - 1) * limit;
        const where = {
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
    async findByUserId(userId, tenantId) {
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
    async findOne(id, tenantId) {
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
            throw new common_1.NotFoundException(`Student ${id} not found`);
        }
        return student;
    }
    async update(id, dto, tenantId, updatedById) {
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
    async deactivate(id, tenantId, deactivatedById) {
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
    async erasePersonalData(id, tenantId, requestedById) {
        const student = await this.findOne(id, tenantId);
        await this.prisma.$transaction(async (tx) => {
            await tx.userProfile.update({
                where: { userId: student.userId },
                data: {
                    firstName: '[ERASED]',
                    lastName: '[ERASED]',
                    dateOfBirth: null,
                    phone: null,
                    address: client_1.Prisma.JsonNull,
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
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = StudentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        event_publisher_service_1.EventPublisher,
        plan_guard_1.PlanGuard])
], StudentsService);
//# sourceMappingURL=students.service.js.map