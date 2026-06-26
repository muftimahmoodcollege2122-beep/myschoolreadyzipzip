import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
export declare class DiscountsService {
    private readonly prisma;
    private readonly audit;
    private readonly logger;
    constructor(prisma: PrismaService, audit: AuditService);
    createDiscount(dto: any, tenantId: string, createdById: string): Promise<any>;
    listDiscounts(tenantId: string): Promise<any>;
    updateDiscount(id: string, dto: any, tenantId: string, userId: string): Promise<any>;
    deleteDiscount(id: string, tenantId: string): Promise<any>;
    createScholarship(dto: any, tenantId: string, createdById: string): Promise<any>;
    listScholarships(tenantId: string): Promise<any>;
    updateScholarship(id: string, dto: any, tenantId: string): Promise<any>;
    grantScholarship(dto: any, tenantId: string, grantedById: string): Promise<any>;
    listGrants(tenantId: string, studentId?: string): Promise<any>;
    revokeGrant(id: string, tenantId: string, userId: string): Promise<any>;
    createInstallmentPlan(dto: any, tenantId: string, createdById: string): Promise<any>;
    listInstallmentPlans(tenantId: string, studentId?: string): Promise<any>;
    recordInstallmentPayment(installmentId: string, tenantId: string, userId: string): Promise<any>;
    createCoupon(dto: any): Promise<any>;
    validateCoupon(code: string, amount: number, plan?: string): Promise<{
        valid: boolean;
        coupon: any;
        discount: number;
    }>;
    applyCoupon(code: string, tenantId: string, discountAmount: number): Promise<any>;
    listCoupons(): Promise<any>;
}
