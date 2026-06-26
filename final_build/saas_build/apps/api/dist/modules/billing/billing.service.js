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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var BillingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../database/prisma.service");
const event_publisher_service_1 = require("../../events/event-publisher.service");
const stripe_1 = __importDefault(require("stripe"));
const PRICE_MAP = {
    GROWTH: process.env.STRIPE_PRICE_GROWTH || '',
    PRO: process.env.STRIPE_PRICE_PRO || '',
};
const PLAN_LIMITS = {
    STARTER: { maxStudents: 200, maxTeachers: 20, smsEnabled: 0, storageGb: 1 },
    GROWTH: { maxStudents: 1000, maxTeachers: 100, smsEnabled: 1, storageGb: 10 },
    PRO: { maxStudents: 5000, maxTeachers: 500, smsEnabled: 1, storageGb: 50 },
    ENTERPRISE: { maxStudents: -1, maxTeachers: -1, smsEnabled: 1, storageGb: -1 },
};
let BillingService = BillingService_1 = class BillingService {
    constructor(prisma, config, events) {
        this.prisma = prisma;
        this.config = config;
        this.events = events;
        this.logger = new common_1.Logger(BillingService_1.name);
        const key = config.get('STRIPE_SECRET_KEY', 'sk_test_placeholder');
        this.stripe = new stripe_1.default(key, { apiVersion: '2025-02-24.acacia', typescript: true, telemetry: false });
    }
    async createCheckoutSession(tenantId, tier) {
        const priceId = PRICE_MAP[tier];
        if (!priceId)
            throw new common_1.BadRequestException(`Invalid tier: ${tier}`);
        const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId }, include: { schools: { take: 1 } } });
        let customerId = tenant.stripeCustomerId;
        if (!customerId) {
            const tenantEmail = tenant.schools?.[0]?.email ?? '';
            const customer = await this.stripe.customers.create({ email: tenantEmail, metadata: { tenantId } });
            customerId = customer.id;
            await this.prisma.tenant.update({ where: { id: tenantId }, data: { stripeCustomerId: customerId } });
        }
        const session = await this.stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${this.config.get('FRONTEND_URL')}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${this.config.get('FRONTEND_URL')}/billing/cancelled`,
            metadata: { tenantId, tier },
            subscription_data: { trial_period_days: 14, metadata: { tenantId, tier } },
        });
        return { url: session.url, sessionId: session.id };
    }
    async createPortalSession(tenantId) {
        const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
        if (!tenant.stripeCustomerId)
            throw new common_1.BadRequestException('No billing account found');
        const session = await this.stripe.billingPortal.sessions.create({
            customer: tenant.stripeCustomerId,
            return_url: `${this.config.get('FRONTEND_URL')}/settings/billing`,
        });
        return { url: session.url };
    }
    async getSubscription(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { tier: true, status: true, stripeSubId: true } });
        return tenant;
    }
    async handleWebhook(rawBody, signature) {
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, signature, this.config.getOrThrow('STRIPE_WEBHOOK_SECRET'));
        }
        catch {
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        try {
            switch (event.type) {
                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                    await this.handleSubscriptionUpdated(event.data.object);
                    break;
                case 'customer.subscription.deleted':
                    await this.handleSubscriptionCancelled(event.data.object);
                    break;
                case 'invoice.payment_succeeded':
                    await this.handlePaymentSucceeded(event.data.object);
                    break;
                case 'invoice.payment_failed':
                    await this.handlePaymentFailed(event.data.object);
                    break;
                default:
                    this.logger.debug(`Unhandled webhook: ${event.type}`);
            }
        }
        catch (err) {
            this.logger.error(`Webhook error: ${err}`);
            throw new common_1.InternalServerErrorException('Webhook processing failed');
        }
    }
    async handleSubscriptionUpdated(sub) {
        const tenantId = sub.metadata.tenantId;
        if (!tenantId)
            return;
        const tier = (sub.metadata.tier || 'GROWTH');
        const limits = PLAN_LIMITS[tier] || PLAN_LIMITS.GROWTH;
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { tier: tier, status: sub.status === 'active' ? 'ACTIVE' : 'TRIAL', stripeSubId: sub.id, planLimits: limits },
        });
        await this.events.publishViaOutbox({ tenantId, topic: 'billing.subscription.updated', key: tenantId, payload: { tenantId, tier, status: sub.status } });
    }
    async handleSubscriptionCancelled(sub) {
        const tenantId = sub.metadata.tenantId;
        if (!tenantId)
            return;
        await this.prisma.tenant.update({ where: { id: tenantId }, data: { status: 'CANCELLED', cancelledAt: new Date(), dataRetainUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) } });
    }
    async handlePaymentSucceeded(invoice) {
        const tenantId = (invoice.subscription_details?.metadata?.tenantId ?? invoice.metadata?.tenantId);
        if (!tenantId)
            return;
        await this.prisma.tenant.update({ where: { id: tenantId }, data: { status: 'ACTIVE', suspendedAt: null } });
    }
    async handlePaymentFailed(invoice) {
        const tenantId = (invoice.subscription_details?.metadata?.tenantId ?? invoice.metadata?.tenantId);
        if (!tenantId)
            return;
        await this.events.publishViaOutbox({ tenantId, topic: 'billing.payment.failed', key: tenantId, payload: { tenantId, invoiceId: invoice.id } });
    }
    async recordUsage(tenantId, metric, quantity) {
        await this.prisma.usageRecord.create({ data: { tenantId, metric, quantity, billingPeriod: new Date().toISOString().slice(0, 7) } });
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = BillingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        event_publisher_service_1.EventPublisher])
], BillingService);
//# sourceMappingURL=billing.service.js.map