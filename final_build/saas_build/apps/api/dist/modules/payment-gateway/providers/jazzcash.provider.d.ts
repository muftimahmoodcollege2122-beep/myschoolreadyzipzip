import { ConfigService } from '@nestjs/config';
export interface JazzCashPaymentRequest {
    amount: number;
    orderId: string;
    customerEmail: string;
    customerPhone: string;
    description: string;
    returnUrl: string;
}
export interface JazzCashPaymentResponse {
    success: boolean;
    paymentId: string;
    redirectUrl?: string;
    formData?: Record<string, string>;
    instructions: string[];
    mobileAccountNumber: string;
    amount: number;
    expiresIn: number;
}
export declare class JazzCashProvider {
    private readonly config;
    private readonly logger;
    private readonly JAZZCASH_MOBILE;
    private readonly MERCHANT_ID;
    private readonly PASSWORD;
    private readonly INTEGRITY_SALT;
    private readonly ACCOUNT_TITLE;
    constructor(config: ConfigService);
    private generateHash;
    initiatePayment(req: JazzCashPaymentRequest): Promise<JazzCashPaymentResponse>;
    verifyWebhook(payload: Record<string, string>): Promise<boolean>;
}
