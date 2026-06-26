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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var FeesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../../common/audit/audit.service");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const dayjs_1 = __importDefault(require("dayjs"));
let FeesService = FeesService_1 = class FeesService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
        this.logger = new common_1.Logger(FeesService_1.name);
    }
    async createInvoice(dto, tenantId) {
        const structure = await this.prisma.feeStructure.findFirst({ where: { id: dto.feeStructureId, tenantId, isActive: true } });
        if (!structure)
            throw new common_1.NotFoundException('Fee structure not found');
        return this.bulkGenerateInvoices(dto.feeStructureId, dto.studentIds, tenantId);
    }
    async createDirectInvoice(dto, tenantId) {
        const school = await this.prisma.school.findFirst({ where: { tenantId } });
        if (!school)
            throw new common_1.NotFoundException('School not found');
        const student = await this.prisma.student.findFirst({ where: { id: dto.studentId, tenantId } });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        return this.prisma.$transaction(async (tx) => {
            const structure = await tx.feeStructure.create({
                data: {
                    tenantId,
                    schoolId: school.id,
                    name: dto.description || (dto.category ?? 'Direct Invoice'),
                    academicYear: new Date().getFullYear().toString(),
                    classIds: [],
                    components: [{ name: dto.description || 'Fee', amount: dto.amount, isOptional: false, dueDay: 15 }],
                    frequency: 'one-time',
                    isActive: false,
                },
            });
            const invoiceNo = `INV-${Date.now()}-${(0, crypto_1.randomUUID)().slice(0, 8).toUpperCase()}`;
            const invoice = await tx.feeInvoice.create({
                data: {
                    studentId: dto.studentId,
                    feeStructureId: structure.id,
                    tenantId,
                    invoiceNo,
                    amount: dto.amount,
                    dueDate: new Date(dto.dueDate),
                    status: client_1.FeeStatus.PENDING,
                },
            });
            await tx.outboxEvent.create({
                data: { tenantId, topic: 'fees.invoice.created', key: invoice.id, payload: { invoiceId: invoice.id }, headers: {} },
            });
            return invoice;
        });
    }
    async bulkGenerateInvoices(feeStructureId, studentIds, tenantId) {
        const structure = await this.prisma.feeStructure.findFirst({ where: { id: feeStructureId, tenantId, isActive: true } });
        if (!structure)
            throw new common_1.NotFoundException('Fee structure not found');
        const components = structure.components;
        const totalAmount = components.filter(c => !c.isOptional).reduce((s, c) => s + c.amount, 0);
        const dueDate = (0, dayjs_1.default)().date(components[0]?.dueDay || 15).toDate();
        let created = 0, skipped = 0;
        await this.prisma.$transaction(async (tx) => {
            for (const studentId of studentIds) {
                const existing = await tx.feeInvoice.findFirst({ where: { studentId, feeStructureId, tenantId, dueDate: { gte: (0, dayjs_1.default)().startOf('month').toDate(), lte: (0, dayjs_1.default)().endOf('month').toDate() } } });
                if (existing) {
                    skipped++;
                    continue;
                }
                const invoiceNo = `INV-${Date.now()}-${(0, crypto_1.randomUUID)().slice(0, 8).toUpperCase()}`;
                await tx.feeInvoice.create({ data: { studentId, feeStructureId, tenantId, invoiceNo, amount: totalAmount, dueDate, status: client_1.FeeStatus.PENDING } });
                created++;
            }
            await tx.outboxEvent.create({ data: { tenantId, topic: 'fees.invoices.generated', key: feeStructureId, payload: { feeStructureId, created, studentIds }, headers: {} } });
        });
        this.logger.log(`Generated ${created} invoices, skipped ${skipped}`);
        return { created, skipped };
    }
    async recordPayment(dto, tenantId, processedById) {
        const invoice = await this.prisma.feeInvoice.findFirst({ where: { id: dto.invoiceId ?? dto.invoiceId, tenantId } });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        const outstanding = Number(invoice.amount) + Number(invoice.fine ?? 0) - Number(invoice.discount ?? 0) - Number(invoice.amountPaid ?? 0);
        if (dto.amount > outstanding)
            throw new common_1.BadRequestException(`Payment ${dto.amount} exceeds outstanding ${outstanding}`);
        await this.prisma.$transaction(async (tx) => {
            await tx.payment.create({ data: { invoiceId: dto.invoiceId, tenantId, amount: dto.amount, method: dto.method, transactionRef: dto.transactionRef ?? null, processedBy: processedById } });
            const newPaid = Number(invoice.amountPaid ?? 0) + dto.amount;
            const newOutstanding = Number(invoice.amount) + Number(invoice.fine ?? 0) - Number(invoice.discount ?? 0) - newPaid;
            const newStatus = newOutstanding <= 0 ? client_1.FeeStatus.PAID : 'PARTIAL';
            await tx.feeInvoice.update({ where: { id: dto.invoiceId }, data: { amountPaid: newPaid, status: newStatus, paidAt: newStatus === client_1.FeeStatus.PAID ? new Date() : undefined } });
            await tx.outboxEvent.create({ data: { tenantId, topic: 'fees.payment.recorded', key: dto.invoiceId, payload: { invoiceId: dto.invoiceId, amount: dto.amount, studentId: invoice.studentId }, headers: {} } });
        });
        await this.audit.log({ tenantId, userId: processedById, action: 'CREATE', entity: 'Payment', entityId: dto.invoiceId, after: { amount: dto.amount, method: dto.method } });
    }
    async getStudentFeeSummary(studentId, tenantId) {
        const invoices = await this.prisma.feeInvoice.findMany({ where: { studentId, tenantId }, orderBy: { dueDate: 'desc' }, include: { feeStructure: true } });
        const totalBilled = invoices.reduce((s, i) => s + Number(i.amount), 0);
        const totalPaid = invoices.reduce((s, i) => s + Number(i.amountPaid ?? 0), 0);
        return { invoices, totalBilled, totalPaid, outstanding: totalBilled - totalPaid };
    }
    async getOutstandingInvoices(schoolId, tenantId) {
        return this.prisma.feeInvoice.findMany({
            where: { tenantId, status: { in: [client_1.FeeStatus.PENDING, 'OVERDUE'] } },
            include: { student: { include: { user: { include: { profile: true } }, enrollments: { include: { section: { include: { class: true } } } } } } },
            orderBy: { dueDate: 'asc' },
        });
    }
    async getRevenueReport(schoolId, tenantId, month, year) {
        const allInvoices = await this.prisma.feeInvoice.findMany({ where: { tenantId } });
        const collected = allInvoices.reduce((s, i) => s + Number(i.amountPaid ?? 0), 0);
        const outstanding = allInvoices.reduce((s, i) => s + Math.max(0, Number(i.amount) - Number(i.amountPaid ?? 0)), 0);
        const total = allInvoices.reduce((s, i) => s + Number(i.amount), 0);
        return {
            collected,
            outstanding,
            collectionRate: total > 0 ? Math.round((collected / total) * 100) : 0,
            totalInvoices: allInvoices.length,
            paid: allInvoices.filter(i => i.status === client_1.FeeStatus.PAID).length,
            partial: allInvoices.filter(i => i.status === 'PARTIAL').length,
            pending: allInvoices.filter(i => i.status === client_1.FeeStatus.PENDING).length,
            overdue: allInvoices.filter(i => i.status === 'OVERDUE').length,
        };
    }
};
exports.FeesService = FeesService;
exports.FeesService = FeesService = FeesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], FeesService);
//# sourceMappingURL=fees.service.js.map