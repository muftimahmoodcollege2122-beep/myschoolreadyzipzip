import { PaymentGatewayService } from './payment-gateway.service';
import { InitiatePaymentDto, VerifyPaymentDto } from './dto/initiate-payment.dto';
export declare class PaymentGatewayController {
    private readonly svc;
    constructor(svc: PaymentGatewayService);
    getPlanPrices(): {
        plan: string;
        pkr: number;
        usd: number;
    }[];
    initiatePayment(dto: InitiatePaymentDto): Promise<any>;
    verifyPayment(dto: VerifyPaymentDto): Promise<{
        success: boolean;
        message: string;
        status: string;
    }>;
    capturePayPal(paypalOrderId: string, internalOrderId: string): Promise<{
        success: boolean;
        captureId: string;
        status: string;
    }>;
    jazzCashWebhook(payload: Record<string, string>): Promise<{
        success: boolean;
    }>;
    getPendingVerifications(): Promise<any>;
    approvePayment(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
