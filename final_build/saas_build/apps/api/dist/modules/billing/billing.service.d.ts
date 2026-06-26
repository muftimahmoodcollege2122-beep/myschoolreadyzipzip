import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { EventPublisher } from '../../events/event-publisher.service';
export declare class BillingService {
    private readonly prisma;
    private readonly config;
    private readonly events;
    private readonly logger;
    private readonly stripe;
    constructor(prisma: PrismaService, config: ConfigService, events: EventPublisher);
    createCheckoutSession(tenantId: string, tier: 'GROWTH' | 'PRO' | 'ENTERPRISE'): Promise<any>;
    createPortalSession(tenantId: string): Promise<any>;
    getSubscription(tenantId: string): Promise<any>;
    handleWebhook(rawBody: Buffer, signature: string): Promise<void>;
    private handleSubscriptionUpdated;
    private handleSubscriptionCancelled;
    private handlePaymentSucceeded;
    private handlePaymentFailed;
    recordUsage(tenantId: string, metric: string, quantity: number): Promise<void>;
}
