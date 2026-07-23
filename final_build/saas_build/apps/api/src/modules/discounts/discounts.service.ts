import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class DiscountsService {
  private readonly logger = new Logger(DiscountsService.name);
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  // ── Fee Discounts ──────────────────────────────────────────
  async createDiscount(dto: any, tenantId: string, createdById: string) {
    const discount = await this.prisma.feeDiscount.create({ data: { tenantId, ...dto, createdById } });
    await this.audit.log({ tenantId, userId: createdById, action: 'CREATE', entity: 'FeeDiscount', entityId: discount.id, after: dto });
    return discount;
  }

  async listDiscounts(tenantId: string) {
    return this.prisma.feeDiscount.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  async updateDiscount(id: string, dto: any, tenantId: string, userId: string) {
    const d = await this.prisma.feeDiscount.findFirst({ where: { id, tenantId } });
    if (!d) throw new NotFoundException('Discount not found');
    return this.prisma.feeDiscount.update({ where: { id }, data: dto });
  }

  async deleteDiscount(id: string, tenantId: string) {
    const d = await this.prisma.feeDiscount.findFirst({ where: { id, tenantId } });
    if (!d) throw new NotFoundException('Discount not found');
    return this.prisma.feeDiscount.update({ where: { id }, data: { isActive: false } });
  }

  // ── Scholarships ───────────────────────────────────────────
  async createScholarship(dto: any, tenantId: string, createdById: string) {
    const s = await this.prisma.scholarship.create({ data: { tenantId, ...dto, createdById } });
    await this.audit.log({ tenantId, userId: createdById, action: 'CREATE', entity: 'Scholarship', entityId: s.id, after: dto });
    return s;
  }

  async listScholarships(tenantId: string) {
    return this.prisma.scholarship.findMany({
      where: { tenantId },
      include: { _count: { select: { grants: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateScholarship(id: string, dto: any, tenantId: string) {
    const s = await this.prisma.scholarship.findFirst({ where: { id, tenantId } });
    if (!s) throw new NotFoundException('Scholarship not found');
    return this.prisma.scholarship.update({ where: { id }, data: dto });
  }

  async grantScholarship(dto: any, tenantId: string, grantedById: string) {
    const scholarship = await this.prisma.scholarship.findFirst({ where: { id: dto.scholarshipId, tenantId } });
    if (!scholarship) throw new NotFoundException('Scholarship not found');
    if (!scholarship.isActive) throw new BadRequestException('Scholarship is inactive');
    if (scholarship.maxRecipients && scholarship.currentRecipients >= scholarship.maxRecipients) {
      throw new BadRequestException('Scholarship recipient limit reached');
    }
    return this.prisma.$transaction!(async tx => {
      const grant = await tx.scholarshipGrant.create({
        data: { tenantId, scholarshipId: dto.scholarshipId, studentId: dto.studentId, invoiceId: dto.invoiceId, amount: dto.amount || scholarship.amount, grantedById, remarks: dto.remarks },
      });
      await tx.scholarship.update({ where: { id: dto.scholarshipId }, data: { currentRecipients: { increment: 1 } } });
      return grant;
    });
  }

  async listGrants(tenantId: string, studentId?: string) {
    return this.prisma.scholarshipGrant.findMany({
      where: { tenantId, ...(studentId && { studentId }) },
      include: { scholarship: true },
      orderBy: { grantedAt: 'desc' },
    });
  }

  async revokeGrant(id: string, tenantId: string, userId: string) {
    const g = await this.prisma.scholarshipGrant.findFirst({ where: { id, tenantId } });
    if (!g) throw new NotFoundException('Grant not found');
    return this.prisma.$transaction!(async tx => {
      await tx.scholarshipGrant.update({ where: { id }, data: { status: 'REVOKED' } });
      if (g.scholarshipId) await tx.scholarship.update({ where: { id: g.scholarshipId }, data: { currentRecipients: { decrement: 1 } } });
    });
  }

  // ── Installment Plans ──────────────────────────────────────
  async createInstallmentPlan(dto: any, tenantId: string, createdById: string) {
    const invoice = await this.prisma.feeInvoice.findFirst({ where: { id: dto.invoiceId, tenantId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    const totalAmount = Number(invoice.amount);
    const installmentAmount = totalAmount / dto.noOfInstallments;
    return this.prisma.$transaction!(async tx => {
      const plan = await tx.feeInstallmentPlan.create({
        data: { tenantId, studentId: invoice.studentId, invoiceId: dto.invoiceId, totalAmount, noOfInstallments: dto.noOfInstallments, createdById },
      });
      const startDate = new Date(dto.startDate || new Date());
      const installments = Array.from({ length: dto.noOfInstallments }, (_, i) => {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        return tx.feeInstallment.create({ data: { planId: plan.id, tenantId, installmentNo: i + 1, dueDate, amount: installmentAmount } });
      });
      await Promise.all(installments);
      return plan;
    });
  }

  async listInstallmentPlans(tenantId: string, studentId?: string) {
    return this.prisma.feeInstallmentPlan.findMany({
      where: { tenantId, ...(studentId && { studentId }) },
      include: { installments: { orderBy: { installmentNo: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async recordInstallmentPayment(installmentId: string, tenantId: string, userId: string) {
    const inst = await this.prisma.feeInstallment.findFirst({ where: { id: installmentId, tenantId } });
    if (!inst) throw new NotFoundException('Installment not found');
    if (inst.status === 'PAID') throw new BadRequestException('Installment already paid');
    return this.prisma.feeInstallment.update({ where: { id: installmentId }, data: { status: 'PAID', paidAt: new Date() } });
  }

  // ── Coupons (SaaS) ─────────────────────────────────────────
  async createCoupon(dto: any) {
    return this.prisma.coupon.create({ data: dto });
  }

  async validateCoupon(code: string, amount: number, plan?: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.isActive) throw new BadRequestException('Invalid or expired coupon');
    if (coupon.validTo && new Date() > coupon.validTo) throw new BadRequestException('Coupon has expired');
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new BadRequestException('Coupon usage limit reached');
    if (coupon.minAmount && amount < Number(coupon.minAmount)) throw new BadRequestException(`Minimum order amount is ${coupon.minAmount}`);
    const plans = coupon.applicablePlans as string[];
    if (plans?.length && plan && !plans.includes(plan)) throw new BadRequestException('Coupon not applicable for this plan');
    const discount = coupon.type === 'PERCENTAGE' ? (amount * Number(coupon.value)) / 100 : Number(coupon.value);
    return { valid: true, coupon, discount: Math.min(discount, amount) };
  }

  async applyCoupon(code: string, tenantId: string, discountAmount: number) {
    await this.prisma.coupon.update({ where: { code }, data: { usedCount: { increment: 1 } } });
    return this.prisma.couponUsage.create({ data: { couponId: (await this.prisma.coupon.findUnique({ where: { code } }))!.id, tenantId, discountAmount } });
  }

  async listCoupons() {
    return this.prisma.coupon.findMany({ include: { _count: { select: { usages: true } } }, orderBy: { createdAt: 'desc' } });
  }
}
