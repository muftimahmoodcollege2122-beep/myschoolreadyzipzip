import { DiscountsService } from './discounts.service';
export declare class DiscountsController {
    private readonly svc;
    constructor(svc: DiscountsService);
    createDiscount(dto: any, tid: string, u: any): Promise<any>;
    listDiscounts(tid: string): Promise<any>;
    updateDiscount(id: string, dto: any, tid: string, u: any): Promise<any>;
    deleteDiscount(id: string, tid: string): Promise<any>;
    createScholarship(dto: any, tid: string, u: any): Promise<any>;
    listScholarships(tid: string): Promise<any>;
    updateScholarship(id: string, dto: any, tid: string): Promise<any>;
    grantScholarship(dto: any, tid: string, u: any): Promise<any>;
    listGrants(tid: string, sid?: string): Promise<any>;
    revokeGrant(id: string, tid: string, u: any): Promise<any>;
    createInstallmentPlan(dto: any, tid: string, u: any): Promise<any>;
    listInstallmentPlans(tid: string, sid?: string): Promise<any>;
    payInstallment(id: string, tid: string, u: any): Promise<any>;
    createCoupon(dto: any): Promise<any>;
    listCoupons(): Promise<any>;
    validateCoupon(dto: any): Promise<{
        valid: boolean;
        coupon: any;
        discount: number;
    }>;
}
