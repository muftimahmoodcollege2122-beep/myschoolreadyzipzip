import { ConfigService } from '@nestjs/config';
export interface PayPalPaymentRequest {
    amount: number;
    currency: string;
    orderId: string;
    customerEmail: string;
    description: string;
    returnUrl: string;
    cancelUrl: string;
}
export interface PayPalPaymentResponse {
    success: boolean;
    paymentId: string;
    approvalUrl: string;
    orderId: string;
    amount: number;
    currency: string;
}
export declare class PayPalProvider {
    private readonly config;
    private readonly logger;
    private readonly BASE_URL;
    private readonly CLIENT_ID;
    private readonly CLIENT_SECRET;
    constructor(config: ConfigService);
    private getAccessToken;
    createOrder(req: PayPalPaymentRequest): Promise<PayPalPaymentResponse>;
    captureOrder(paypalOrderId: string): Promise<{
        success: boolean;
        captureId: string;
        status: string;
    }>;
}
