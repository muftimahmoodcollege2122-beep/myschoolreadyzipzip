"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const fees_service_1 = require("./fees.service");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../../common/audit/audit.service");
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
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                fees_service_1.FeesService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
                { provide: audit_service_1.AuditService, useValue: mockAudit },
            ],
        }).compile();
        service = module.get(fees_service_1.FeesService);
        jest.clearAllMocks();
    });
    it('getStudentFeeSummary scopes to tenantId', async () => {
        mockPrisma.feeInvoice.findMany.mockResolvedValue([]);
        mockPrisma.feePayment.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
        mockPrisma.feeInvoice.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
        await service.getStudentFeeSummary('student-1', 'tenant-1');
        expect(mockPrisma.feeInvoice.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ tenantId: 'tenant-1' }) }));
    });
    it('recordPayment fires outbox event', async () => {
        const invoice = { id: 'inv-1', amount: 5000, status: 'PENDING', tenantId: 'tenant-1' };
        mockPrisma.feeInvoice.findFirst.mockResolvedValue(invoice);
        mockPrisma.feePayment.create.mockResolvedValue({ id: 'pay-1' });
        mockPrisma.feeInvoice.update.mockResolvedValue({});
        mockPrisma.outboxEvent.create.mockResolvedValue({});
        mockPrisma.feePayment.aggregate.mockResolvedValue({ _sum: { amount: 5000 } });
        await service.recordPayment({ invoiceId: 'inv-1', amount: 5000, paymentMethod: 'CASH' }, 'tenant-1', 'user-1');
        expect(mockPrisma.outboxEvent.create).toHaveBeenCalled();
    });
});
//# sourceMappingURL=fees.service.spec.js.map