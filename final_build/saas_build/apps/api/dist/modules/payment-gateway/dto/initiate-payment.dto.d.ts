export declare enum PaymentMethod {
    EASYPAISA = "EASYPAISA",
    JAZZCASH = "JAZZCASH",
    BANK_TRANSFER = "BANK_TRANSFER",
    IBAN = "IBAN",
    PAYPAL = "PAYPAL"
}
export declare enum PaymentPlan {
    STARTER = "STARTER",
    PROFESSIONAL = "PROFESSIONAL",
    ENTERPRISE = "ENTERPRISE"
}
export declare class InitiatePaymentDto {
    method: PaymentMethod;
    plan: PaymentPlan;
    tenantId: string;
    email: string;
    schoolName: string;
    phone?: string;
    senderAccount?: string;
}
export declare class VerifyPaymentDto {
    paymentId: string;
    transactionId: string;
    screenshot?: string;
}
