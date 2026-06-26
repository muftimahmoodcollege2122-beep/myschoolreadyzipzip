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
var DiscountsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../../common/audit/audit.service");
let DiscountsService = DiscountsService_1 = class DiscountsService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
        this.logger = new common_1.Logger(DiscountsService_1.name);
    }
    async createDiscount(dto, tenantId, createdById) {
        const discount = await this.prisma.feeDiscount.create({ data: { tenantId, ...dto, createdById } });
        await this.audit.log({ tenantId, userId: createdById, action: 'CREATE', entity: 'FeeDiscount', entityId: discount.id, after: dto });
        return discount;
    }
    async listDiscounts(tenantId) {
        return this.prisma.feeDiscount.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
    }
    async updateDiscount(id, dto, tenantId, userId) {
        const d = await this.prisma.feeDiscount.findFirst({ where: { id, tenantId } });
        if (!d)
            throw new common_1.NotFoundException('Discount not found');
        return this.prisma.feeDiscount.update({ where: { id }, data: dto });
    }
    async deleteDiscount(id, tenantId) {
        const d = await this.prisma.feeDiscount.findFirst({ where: { id, tenantId } });
        if (!d)
            throw new common_1.NotFoundException('Discount not found');
        return this.prisma.feeDiscount.update({ where: { id }, data: { isActive: false } });
    }
    async createScholarship(dto, tenantId, createdById) {
        const s = await this.prisma.scholarship.create({ data: { tenantId, ...dto, createdById } });
        await this.audit.log({ tenantId, userId: createdById, action: 'CREATE', entity: 'Scholarship', entityId: s.id, after: dto });
        return s;
    }
    async listScholarships(tenantId) {
        return this.prisma.scholarship.findMany({
            where: { tenantId },
            include: { _count: { select: { grants: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateScholarship(id, dto, tenantId) {
        const s = await this.prisma.scholarship.findFirst({ where: { id, tenantId } });
        if (!s)
            throw new common_1.NotFoundException('Scholarship not found');
        return this.prisma.scholarship.update({ where: { id }, data: dto });
    }
    async grantScholarship(dto, tenantId, grantedById) {
        const scholarship = await this.prisma.scholarship.findFirst({ where: { id: dto.scholarshipId, tenantId } });
        if (!scholarship)
            throw new common_1.NotFoundException('Scholarship not found');
        if (!scholarship.isActive)
            throw new common_1.BadRequestException('Scholarship is inactive');
        if (scholarship.maxRecipients && scholarship.currentRecipients >= scholarship.maxRecipients) {
            throw new common_1.BadRequestException('Scholarship recipient limit reached');
        }
        return this.prisma.$transaction(async (tx) => {
            const grant = await tx.scholarshipGrant.create({
                data: { tenantId, scholarshipId: dto.scholarshipId, studentId: dto.studentId, invoiceId: dto.invoiceId, amount: dto.amount || scholarship.amount, grantedById, remarks: dto.remarks },
            });
            await tx.scholarship.update({ where: { id: dto.scholarshipId }, data: { currentRecipients: { increment: 1 } } });
            return grant;
        });
    }
    async listGrants(tenantId, studentId) {
        return this.prisma.scholarshipGrant.findMany({
            where: { tenantId, ...(studentId && { studentId }) },
            include: { scholarship: true },
            orderBy: { grantedAt: 'desc' },
        });
    }
    async revokeGrant(id, tenantId, userId) {
        const g = await this.prisma.scholarshipGrant.findFirst({ where: { id, tenantId } });
        if (!g)
            throw new common_1.NotFoundException('Grant not found');
        return this.prisma.$transaction(async (tx) => {
            await tx.scholarshipGrant.update({ where: { id }, data: { status: 'REVOKED' } });
            if (g.scholarshipId)
                await tx.scholarship.update({ where: { id: g.scholarshipId }, data: { currentRecipients: { decrement: 1 } } });
        });
    }
    async createInstallmentPlan(dto, tenantId, createdById) {
        const invoice = await this.prisma.feeInvoice.findFirst({ where: { id: dto.invoiceId, tenantId } });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        const totalAmount = Number(invoice.amount);
        const installmentAmount = totalAmount / dto.noOfInstallments;
        return this.prisma.$transaction(async (tx) => {
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
    async listInstallmentPlans(tenantId, studentId) {
        return this.prisma.feeInstallmentPlan.findMany({
            where: { tenantId, ...(studentId && { studentId }) },
            include: { installments: { orderBy: { installmentNo: 'asc' } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async recordInstallmentPayment(installmentId, tenantId, userId) {
        const inst = await this.prisma.feeInstallment.findFirst({ where: { id: installmentId, tenantId } });
        if (!inst)
            throw new common_1.NotFoundException('Installment not found');
        if (inst.status === 'PAID')
            throw new common_1.BadRequestException('Installment already paid');
        return this.prisma.feeInstallment.update({ where: { id: installmentId }, data: { status: 'PAID', paidAt: new Date() } });
    }
    async createCoupon(dto) {
        return this.prisma.coupon.create({ data: dto });
    }
    async validateCoupon(code, amount, plan) {
        const coupon = await this.prisma.coupon.findUnique({ where: { code } });
        if (!coupon || !coupon.isActive)
            throw new common_1.BadRequestException('Invalid or expired coupon');
        if (coupon.validTo && new Date() > coupon.validTo)
            throw new common_1.BadRequestException('Coupon has expired');
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
            throw new common_1.BadRequestException('Coupon usage limit reached');
        if (coupon.minAmount && amount < Number(coupon.minAmount))
            throw new common_1.BadRequestException(`Minimum order amount is ${coupon.minAmount}`);
        const plans = coupon.applicablePlans;
        if (plans?.length && plan && !plans.includes(plan))
            throw new common_1.BadRequestException('Coupon not applicable for this plan');
        const discount = coupon.type === 'PERCENTAGE' ? (amount * Number(coupon.value)) / 100 : Number(coupon.value);
        return { valid: true, coupon, discount: Math.min(discount, amount) };
    }
    async applyCoupon(code, tenantId, discountAmount) {
        await this.prisma.coupon.update({ where: { code }, data: { usedCount: { increment: 1 } } });
        return this.prisma.couponUsage.create({ data: { couponId: (await this.prisma.coupon.findUnique({ where: { code } })).id, tenantId, discountAmount } });
    }
    async listCoupons() {
        return this.prisma.coupon.findMany({ include: { _count: { select: { usages: true } } }, orderBy: { createdAt: 'desc' } });
    }
};
exports.DiscountsService = DiscountsService;
exports.DiscountsService = DiscountsService = DiscountsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], DiscountsService);
//# sourceMappingURL=discounts.service.js.map