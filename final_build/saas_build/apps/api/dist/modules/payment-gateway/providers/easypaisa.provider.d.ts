import { ConfigService } from '@nestjs/config';
export interface EasypaisaPaymentRequest {
    amount: number;
    orderId: string;
    customerEmail: string;
    customerPhone: string;
    description: string;
}
export interface EasypaisaPaymentResponse {
    success: boolean;
    paymentId: string;
    instructions: string[];
    accountNumber: string;
    amount: number;
    expiresIn: number;
}
export declare class EasypaisaProvider {
    private readonly config;
    private readonly logger;
    private readonly EASYPAISA_ACCOUNT;
    private readonly ACCOUNT_TITLE;
    constructor(config: ConfigService);
    initiatePayment(req: EasypaisaPaymentRequest): Promise<EasypaisaPaymentResponse>;
    verifyTransaction(transactionId: string, expectedAmount: number): Promise<boolean>;
}
