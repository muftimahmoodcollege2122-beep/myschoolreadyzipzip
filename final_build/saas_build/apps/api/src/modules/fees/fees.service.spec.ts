import { Test, TestingModule } from '@nestjs/testing';
import { FeesService } from './fees.service';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

const mockPrisma = {
  feeInvoice: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), aggregate: jest.fn() },
  feePayment: { create: jest.fn(), findMany: jest.fn(), aggregate: jest.fn() },
  studentEnrollment: { findMany: jest.fn() },
  outboxEvent: { create: jest.fn() },
  $transaction: jest.fn(cb => cb(mockPrisma)),
  $queryRaw: jest.fn(),
};
const mockAudit = { log: jest.fn() };

describe('FeesService', () => {
  let service: FeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();
    service = module.get<FeesService>(FeesService);
    jest.clearAllMocks();
  });

  it('getStudentFeeSummary scopes to tenantId', async () => {
    mockPrisma.feeInvoice.findMany.mockResolvedValue([]);
    mockPrisma.feePayment.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
    mockPrisma.feeInvoice.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
    await service.getStudentFeeSummary('student-1', 'tenant-1');
    expect(mockPrisma.feeInvoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 'tenant-1' }) })
    );
  });

  it('recordPayment fires outbox event', async () => {
    const invoice = { id: 'inv-1', amount: 5000, status: 'PENDING', tenantId: 'tenant-1' };
    mockPrisma.feeInvoice.findFirst.mockResolvedValue(invoice);
    mockPrisma.feePayment.create.mockResolvedValue({ id: 'pay-1' });
    mockPrisma.feeInvoice.update.mockResolvedValue({});
    mockPrisma.outboxEvent.create.mockResolvedValue({});
    mockPrisma.feePayment.aggregate.mockResolvedValue({ _sum: { amount: 5000 } });
    await service.recordPayment({ invoiceId: 'inv-1', amount: 5000, paymentMethod: 'CASH' } as any, 'tenant-1', 'user-1');
    expect(mockPrisma.outboxEvent.create).toHaveBeenCalled();
  });
});
