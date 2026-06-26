import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateInvoiceDto, RecordPaymentDto } from './dto/create-invoice.dto';
import { FeeStatus } from '../../common/prisma-enums';;
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';

@Injectable()
export class FeesService {
  private readonly logger = new Logger(FeesService.name);
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async createInvoice(dto: CreateInvoiceDto, tenantId: string): Promise<any> {
    const structure = await this.prisma.feeStructure.findFirst({ where: { id: dto.feeStructureId, tenantId, isActive: true } });
    if (!structure) throw new NotFoundException('Fee structure not found');
    return this.bulkGenerateInvoices(dto.feeStructureId, dto.studentIds, tenantId);
  }

  async createDirectInvoice(dto: { studentId: string; description: string; amount: number; dueDate: string; category?: string }, tenantId: string): Promise<any> {
    const school = await this.prisma.school.findFirst({ where: { tenantId } });
    if (!school) throw new NotFoundException('School not found');

    const student = await this.prisma.student.findFirst({ where: { id: dto.studentId, tenantId } });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.$transaction(async tx => {
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

      const invoiceNo = `INV-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
      const invoice = await tx.feeInvoice.create({
        data: {
          studentId: dto.studentId,
          feeStructureId: structure.id,
          tenantId,
          invoiceNo,
          amount: dto.amount,
          dueDate: new Date(dto.dueDate),
          status: FeeStatus.PENDING,
        },
      });

      await tx.outboxEvent.create({
        data: { tenantId, topic: 'fees.invoice.created', key: invoice.id, payload: { invoiceId: invoice.id }, headers: {} },
      });

      return invoice;
    });
  }

  async bulkGenerateInvoices(feeStructureId: string, studentIds: string[], tenantId: string): Promise<{ created: number; skipped: number }> {
    const structure = await this.prisma.feeStructure.findFirst({ where: { id: feeStructureId, tenantId, isActive: true } });
    if (!structure) throw new NotFoundException('Fee structure not found');

    const components = structure.components as Array<{ name: string; amount: number; isOptional: boolean; dueDay: number }>;
    const totalAmount = components.filter(c => !c.isOptional).reduce((s, c) => s + c.amount, 0);
    const dueDate = dayjs().date(components[0]?.dueDay || 15).toDate();
    let created = 0, skipped = 0;

    await this.prisma.$transaction(async tx => {
      for (const studentId of studentIds) {
        const existing = await tx.feeInvoice.findFirst({ where: { studentId, feeStructureId, tenantId, dueDate: { gte: dayjs().startOf('month').toDate(), lte: dayjs().endOf('month').toDate() } } });
        if (existing) { skipped++; continue; }
        const invoiceNo = `INV-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
        await tx.feeInvoice.create({ data: { studentId, feeStructureId, tenantId, invoiceNo, amount: totalAmount, dueDate, status: FeeStatus.PENDING } });
        created++;
      }
      await tx.outboxEvent.create({ data: { tenantId, topic: 'fees.invoices.generated', key: feeStructureId, payload: { feeStructureId, created, studentIds }, headers: {} } });
    });

    this.logger.log(`Generated ${created} invoices, skipped ${skipped}`);
    return { created, skipped };
  }

  async recordPayment(dto: RecordPaymentDto, tenantId: string, processedById: string): Promise<void> {
    const invoice = await this.prisma.feeInvoice.findFirst({ where: { id: (dto as any).invoiceId ?? dto.invoiceId, tenantId } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const outstanding = Number(invoice.amount) + Number(invoice.fine ?? 0) - Number(invoice.discount ?? 0) - Number(invoice.amountPaid ?? 0);
    if (dto.amount > outstanding) throw new BadRequestException(`Payment ${dto.amount} exceeds outstanding ${outstanding}`);

    await this.prisma.$transaction(async tx => {
      await tx.payment.create({ data: { invoiceId: dto.invoiceId, tenantId, amount: dto.amount, method: dto.method as any, transactionRef: dto.transactionRef ?? null, processedBy: processedById } });
      const newPaid = Number(invoice.amountPaid ?? 0) + dto.amount;
      const newOutstanding = Number(invoice.amount) + Number(invoice.fine ?? 0) - Number(invoice.discount ?? 0) - newPaid;
      const newStatus = newOutstanding <= 0 ? FeeStatus.PAID : 'PARTIAL' as any;
      await tx.feeInvoice.update({ where: { id: dto.invoiceId }, data: { amountPaid: newPaid, status: newStatus, paidAt: newStatus === FeeStatus.PAID ? new Date() : undefined } });
      await tx.outboxEvent.create({ data: { tenantId, topic: 'fees.payment.recorded', key: dto.invoiceId, payload: { invoiceId: dto.invoiceId, amount: dto.amount, studentId: invoice.studentId }, headers: {} } });
    });

    await this.audit.log({ tenantId, userId: processedById, action: 'CREATE', entity: 'Payment', entityId: dto.invoiceId, after: { amount: dto.amount, method: dto.method } });
  }

  async getStudentFeeSummary(studentId: string, tenantId: string): Promise<any> {
    const invoices = await this.prisma.feeInvoice.findMany({ where: { studentId, tenantId }, orderBy: { dueDate: 'desc' }, include: { feeStructure: true } });
    const totalBilled = invoices.reduce((s, i) => s + Number(i.amount), 0);
    const totalPaid = invoices.reduce((s, i) => s + Number(i.amountPaid ?? 0), 0);
    return { invoices, totalBilled, totalPaid, outstanding: totalBilled - totalPaid };
  }

  async getOutstandingInvoices(schoolId: string, tenantId: string): Promise<any[]> {
    return this.prisma.feeInvoice.findMany({
      where: { tenantId, status: { in: [FeeStatus.PENDING, 'OVERDUE' as any] } },
      include: { student: { include: { user: { include: { profile: true } }, enrollments: { include: { section: { include: { class: true } } } } } } },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getRevenueReport(schoolId: string, tenantId: string, month: number, year: number): Promise<any> {
    const allInvoices = await this.prisma.feeInvoice.findMany({ where: { tenantId } });
    const collected = allInvoices.reduce((s, i) => s + Number(i.amountPaid ?? 0), 0);
    const outstanding = allInvoices.reduce((s, i) => s + Math.max(0, Number(i.amount) - Number(i.amountPaid ?? 0)), 0);
    const total = allInvoices.reduce((s, i) => s + Number(i.amount), 0);
    return {
      collected,
      outstanding,
      collectionRate: total > 0 ? Math.round((collected / total) * 100) : 0,
      totalInvoices: allInvoices.length,
      paid: allInvoices.filter(i => i.status === FeeStatus.PAID).length,
      partial: allInvoices.filter(i => (i.status as string) === 'PARTIAL').length,
      pending: allInvoices.filter(i => i.status === FeeStatus.PENDING).length,
      overdue: allInvoices.filter(i => (i.status as string) === 'OVERDUE').length,
    };
  }
}
