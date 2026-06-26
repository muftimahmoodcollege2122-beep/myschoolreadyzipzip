import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { EventPublisher } from '../../events/event-publisher.service';
import { EasypaisaProvider } from './providers/easypaisa.provider';
import { JazzCashProvider } from './providers/jazzcash.provider';
import { BankTransferProvider } from './providers/bank-transfer.provider';
import { PayPalProvider } from './providers/paypal.provider';
import { InitiatePaymentDto, VerifyPaymentDto } from './dto/initiate-payment.dto';
export declare class PaymentGatewayService {
    private readonly prisma;
    private readonly config;
    private readonly events;
    private readonly easypaisa;
    private readonly jazzcash;
    private readonly bankTransfer;
    private readonly paypal;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService, events: EventPublisher, easypaisa: EasypaisaProvider, jazzcash: JazzCashProvider, bankTransfer: BankTransferProvider, paypal: PayPalProvider);
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
    handleJazzCashWebhook(payload: Record<string, string>): Promise<{
        success: boolean;
    }>;
    getPendingVerifications(): Promise<any>;
    approveManualPayment(outboxId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getPlanPrices(): {
        plan: string;
        pkr: number;
        usd: number;
    }[];
}
