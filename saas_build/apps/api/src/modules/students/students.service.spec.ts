import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { PlanGuard } from '../../common/guards/plan.guard';
import { CacheService } from '../../common/cache/cache.service';

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
  let service: StudentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
        { provide: PlanGuard, useValue: mockPlan },
        { provide: CacheService, useValue: mockCache },
      ],
    }).compile();
    service = module.get<StudentsService>(StudentsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns paginated students for tenant', async () => {
      mockPrisma.student.findMany.mockResolvedValue([{ id: '1', rollNumber: 'S001' }]);
      mockPrisma.student.count.mockResolvedValue(1);
      const result = await service.findAll('tenant-1', 'school-1', { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(mockPrisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ tenantId: 'tenant-1' }) })
      );
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
