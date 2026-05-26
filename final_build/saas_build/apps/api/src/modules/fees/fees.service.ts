import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateInvoiceDto, RecordPaymentDto } from './dto/create-invoice.dto';
import { FeeStatus } from '@prisma/client';
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

  async recordPayment(dto: RecordPaymentDto & { invoiceId: string }, tenantId: string, processedById: string): Promise<void> {
    const invoice = await this.prisma.feeInvoice.findFirst({ where: { id: dto.invoiceId, tenantId } });
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
      where: { tenantId, status: { in: [FeeStatus.PENDING, 'OVERDUE' as any] }, student: { schoolId } },
      include: { student: { include: { user: { include: { profile: true } } } } },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getRevenueReport(schoolId: string, tenantId: string, month: number, year: number): Promise<any> {
    return this.prisma.$queryRaw`
      SELECT TO_CHAR(fi.created_at,'YYYY-MM') as month,
        SUM(fi.amount) as total_billed, SUM(fi.amount_paid) as total_collected,
        SUM(fi.amount - COALESCE(fi.amount_paid,0)) as outstanding
      FROM fee_invoices fi
      JOIN students s ON s.id = fi.student_id
      WHERE fi.tenant_id = ${tenantId}::uuid AND s.school_id = ${schoolId}::uuid
        AND EXTRACT(YEAR FROM fi.created_at) = ${year}
        AND EXTRACT(MONTH FROM fi.created_at) = ${month}
      GROUP BY TO_CHAR(fi.created_at,'YYYY-MM')
    `;
  }
}
