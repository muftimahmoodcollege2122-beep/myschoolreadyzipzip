/**
 * Fee management service — billing, payments, and financial tracking.
 * createInvoice(): generates fee invoice for a student
 * recordPayment(): records JazzCash/EasyPaisa/bank payment against invoice
 * getOutstandingFees(): list of unpaid invoices with aging
 * generateReceipt(): creates PDF receipt for a payment
 * applyDiscount(): applies scholarship or fee waiver
 * sendReminders(): WhatsApp/SMS to parents with overdue fees
 */

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateInvoiceDto, RecordPaymentDto } from './dto/create-invoice.dto';
import { FeeStatus } from '../../common/prisma-enums';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';
import { FeesRealtimeInterceptor } from './fees.realtime.interceptor';
import { parseSpreadsheet, buildTemplate, buildExport, cleanCell, ImportResult, RowError } from '../../common/import/xlsx-import.util';

@Injectable()
export class FeesService {
  private readonly logger = new Logger(FeesService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly realtimeInterceptor: FeesRealtimeInterceptor,
  ) {}

  async createInvoice(dto: CreateInvoiceDto, tenantId: string): Promise<any> {
    const structure = await this.prisma.feeStructure.findFirst({ where: { id: dto.feeStructureId, tenantId, isActive: true } });
    if (!structure) throw new NotFoundException('Fee structure not found');
    return this.bulkGenerateInvoices(dto.feeStructureId, dto.studentIds, tenantId);
  }

  async createDirectInvoice(dto: { studentId: string; description: string; amount: number; dueDate: string; category?: string }, tenantId: string): Promise<any> {
    const school = await this.prisma.school.findFirst({ where: { tenantId }, orderBy: { createdAt: 'asc' } });
    if (!school) throw new NotFoundException('School not found');

    const student = await this.prisma.student.findFirst({ where: { id: dto.studentId, tenantId } });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.$transaction!(async tx => {
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

    await this.prisma.$transaction!(async tx => {
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

    let createdPaymentId = '';
    await this.prisma.$transaction!(async tx => {
      const payment = await tx.payment.create({ data: { invoiceId: dto.invoiceId, tenantId, amount: dto.amount, method: dto.method as any, transactionRef: dto.transactionRef ?? null, processedBy: processedById } });
      createdPaymentId = payment.id;
      const newPaid = Number(invoice.amountPaid ?? 0) + dto.amount;
      const newOutstanding = Number(invoice.amount) + Number(invoice.fine ?? 0) - Number(invoice.discount ?? 0) - newPaid;
      const newStatus = newOutstanding <= 0 ? FeeStatus.PAID : 'PARTIAL' as any;
      await tx.feeInvoice.update({ where: { id: dto.invoiceId }, data: { amountPaid: newPaid, status: newStatus, paidAt: newStatus === FeeStatus.PAID ? new Date() : undefined } });
      await tx.outboxEvent.create({ data: { tenantId, topic: 'fees.payment.recorded', key: dto.invoiceId, payload: { invoiceId: dto.invoiceId, amount: dto.amount, studentId: invoice.studentId }, headers: {} } });
    });

    await this.audit.log({ tenantId, userId: processedById, action: 'CREATE', entity: 'Payment', entityId: dto.invoiceId, after: { amount: dto.amount, method: dto.method } });

    // Fire live update to fees pages + dashboard, best-effort (never blocks/breaks the payment)
    this.prisma.student.findFirst({
      where: { id: invoice.studentId, tenantId },
      include: { user: { include: { profile: true } } },
    }).then(student => {
      const studentName = student ? `${student.user.profile?.firstName ?? ''} ${student.user.profile?.lastName ?? ''}`.trim() : 'Student';
      return this.realtimeInterceptor.afterPaymentRecorded(tenantId, {
        invoiceId: dto.invoiceId,
        studentId: invoice.studentId,
        studentName,
        amount: dto.amount,
        paymentMethod: dto.method,
        receiptNumber: createdPaymentId,
      });
    }).catch(err => this.logger.warn(`Real-time fee payment broadcast failed: ${err.message}`));
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

  // ── Edit invoice ─────────────────────────────────────────────────────────

  async editInvoice(id: string, tenantId: string, dto: { amount?: number; dueDate?: string; discount?: number; fine?: number; notes?: string }, editedById: string) {
    const invoice = await this.prisma.feeInvoice.findFirst({ where: { id, tenantId } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const newAmount = dto.amount ?? Number(invoice.amount);
    const newDiscount = dto.discount ?? Number(invoice.discount ?? 0);
    const newFine = dto.fine ?? Number(invoice.fine ?? 0);
    const paid = Number(invoice.amountPaid ?? 0);
    const outstanding = newAmount + newFine - newDiscount - paid;
    const newStatus = outstanding <= 0 ? FeeStatus.PAID : (paid > 0 ? 'PARTIAL' as any : FeeStatus.PENDING);

    const updated = await this.prisma.feeInvoice.update({
      where: { id },
      data: {
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.dueDate !== undefined && { dueDate: new Date(dto.dueDate) }),
        ...(dto.discount !== undefined && { discount: dto.discount }),
        ...(dto.fine !== undefined && { fine: dto.fine }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        status: newStatus,
      },
    });

    await this.audit.log({ tenantId, userId: editedById, action: 'UPDATE', entity: 'FeeInvoice', entityId: id, before: { amount: invoice.amount, dueDate: invoice.dueDate }, after: { amount: updated.amount, dueDate: updated.dueDate } });
    return updated;
  }

  // ── Bulk import / export ────────────────────────────────────────────────

  private readonly IMPORT_HEADERS = ['Student Admission No', 'Description', 'Amount', 'Due Date (YYYY-MM-DD)', 'Category'];

  getImportTemplate(): Buffer {
    return buildTemplate(this.IMPORT_HEADERS, {
      'Student Admission No': 'ADM-2026-001', 'Description': 'Tuition Fee - April',
      'Amount': '4000', 'Due Date (YYYY-MM-DD)': '2026-04-10', 'Category': 'Tuition',
    });
  }

  /**
   * Bulk-creates fee invoices from a spreadsheet — for migrating outstanding
   * dues from an old system, or issuing many one-off invoices at once.
   * Each row becomes its own direct invoice (same pattern as createDirectInvoice).
   */
  async bulkImport(buffer: Buffer, tenantId: string, createdById: string): Promise<ImportResult<any>> {
    const school = await this.prisma.school.findFirst({ where: { tenantId }, orderBy: { createdAt: 'asc' } });
    if (!school) throw new Error('School not found for this tenant');

    const rows = parseSpreadsheet(buffer);
    if (rows.length === 0) throw new BadRequestException('No rows found in the uploaded file. Please use the provided template.');
    if (rows.length > 1000) throw new BadRequestException('Import limited to 1000 rows per file. Please split into smaller batches.');

    const students = await this.prisma.student.findMany({ where: { tenantId, isActive: true }, select: { id: true, admissionNo: true } });
    const studentMap = new Map(students.map(s => [s.admissionNo, s.id]));

    const created: any[] = [];
    const errors: RowError[] = [];

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2;
      const row = rows[i];
      try {
        const admissionNo = cleanCell(row['Student Admission No']);
        const description = cleanCell(row['Description']);
        const amountRaw = cleanCell(row['Amount']);
        const dueDateRaw = cleanCell(row['Due Date (YYYY-MM-DD)']) ?? cleanCell(row['Due Date']);
        const category = cleanCell(row['Category']);

        const missing: string[] = [];
        if (!admissionNo) missing.push('Student Admission No');
        if (!amountRaw) missing.push('Amount');
        if (!dueDateRaw) missing.push('Due Date');
        if (missing.length) { errors.push({ row: rowNum, message: `Missing required field(s): ${missing.join(', ')}` }); continue; }

        const studentId = studentMap.get(admissionNo!);
        if (!studentId) { errors.push({ row: rowNum, message: `No active student found with Admission No "${admissionNo}"` }); continue; }

        const amount = Number(amountRaw);
        if (isNaN(amount) || amount <= 0) { errors.push({ row: rowNum, message: `Invalid Amount: ${amountRaw}` }); continue; }

        const dueDate = new Date(dueDateRaw!);
        if (isNaN(dueDate.getTime())) { errors.push({ row: rowNum, message: `Invalid Due Date: ${dueDateRaw}` }); continue; }

        const invoice = await this.createDirectInvoice({ studentId, description: description ?? 'Imported Invoice', amount, dueDate: dueDate.toISOString(), category }, tenantId);
        created.push(invoice);
      } catch (err: any) {
        errors.push({ row: rowNum, message: err?.message ?? 'Unknown error' });
      }
    }

    if (created.length > 0) {
      await this.audit.log({ tenantId, userId: createdById, action: 'CREATE', entity: 'FeeInvoice', entityId: 'bulk-import', after: { count: created.length, source: 'bulk-import' } });
    }

    return { successCount: created.length, failedCount: errors.length, created, errors };
  }

  async exportToExcel(tenantId: string, schoolId?: string): Promise<Buffer> {
    const invoices = await this.prisma.feeInvoice.findMany({
      where: { tenantId, ...(schoolId && { student: { schoolId } }) },
      include: { student: { include: { user: { include: { profile: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });
    const rows = invoices.map(inv => ({
      'Invoice No': inv.invoiceNo,
      'Student Name': `${inv.student.user.profile?.firstName ?? ''} ${inv.student.user.profile?.lastName ?? ''}`.trim(),
      'Admission No': inv.student.admissionNo,
      'Amount': Number(inv.amount),
      'Discount': Number(inv.discount ?? 0),
      'Fine': Number(inv.fine ?? 0),
      'Amount Paid': Number(inv.amountPaid ?? 0),
      'Status': inv.status,
      'Due Date': inv.dueDate.toISOString().slice(0, 10),
      'Issued At': inv.issuedAt.toISOString().slice(0, 10),
      'Paid At': inv.paidAt ? inv.paidAt.toISOString().slice(0, 10) : '',
    }));
    return buildExport(rows, 'Fee Invoices');
  }
}
