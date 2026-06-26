"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const students_service_1 = require("./students.service");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../../common/audit/audit.service");
const plan_guard_1 = require("../../common/guards/plan.guard");
const cache_service_1 = require("../../common/cache/cache.service");
const mockPrisma = {
    student: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    outboxEvent: { create: jest.fn() },
    $transaction: jest.fn(cb => cb(mockPrisma)),
};
const mockAudit = { log: jest.fn() };
const mockPlan = { assertStudentLimit: jest.fn() };
const mockCache = { get: jest.fn().mockResolvedValue(null), set: jest.fn(), del: jest.fn() };
describe('StudentsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                students_service_1.StudentsService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
                { provide: audit_service_1.AuditService, useValue: mockAudit },
                { provide: plan_guard_1.PlanGuard, useValue: mockPlan },
                { provide: cache_service_1.CacheService, useValue: mockCache },
            ],
        }).compile();
        service = module.get(students_service_1.StudentsService);
        jest.clearAllMocks();
    });
    describe('findAll', () => {
        it('returns paginated students for tenant', async () => {
            mockPrisma.student.findMany.mockResolvedValue([{ id: '1', rollNumber: 'S001' }]);
            mockPrisma.student.count.mockResolvedValue(1);
            const result = await service.findAll('tenant-1', 'school-1', { page: 1, limit: 10 });
            expect(result.data).toHaveLength(1);
            expect(result.meta.total).toBe(1);
            expect(mockPrisma.student.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ tenantId: 'tenant-1' }) }));
        });
        it('always scopes query to tenantId', async () => {
            mockPrisma.student.findMany.mockResolvedValue([]);
            mockPrisma.student.count.mockResolvedValue(0);
            await service.findAll('my-tenant', 'my-school', {});
            const call = mockPrisma.student.findMany.mock.calls[0][0];
            expect(call.where.tenantId).toBe('my-tenant');
        });
    });
    describe('findOne', () => {
        it('throws NotFoundException for unknown student', async () => {
            mockPrisma.student.findFirst.mockResolvedValue(null);
            await expect(service.findOne('bad-id', 'tenant-1')).rejects.toThrow('Student not found');
        });
        it('returns student when found', async () => {
            const student = { id: 's1', rollNumber: 'S001', tenantId: 'tenant-1' };
            mockPrisma.student.findFirst.mockResolvedValue(student);
            const result = await service.findOne('s1', 'tenant-1');
            expect(result.id).toBe('s1');
        });
    });
});
//# sourceMappingURL=students.service.spec.js.map