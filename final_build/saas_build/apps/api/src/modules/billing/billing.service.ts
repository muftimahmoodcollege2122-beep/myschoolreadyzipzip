import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { EventPublisher } from '../../events/event-publisher.service';
import Stripe from 'stripe';

const PRICE_MAP: Record<string, string> = {
  GROWTH: process.env.STRIPE_PRICE_GROWTH || '',
  PRO:    process.env.STRIPE_PRICE_PRO    || '',
};

const PLAN_LIMITS: Record<string, Record<string, number>> = {
  STARTER:    { maxStudents: 200,  maxTeachers: 20,  smsEnabled: 0, storageGb: 1 },
  GROWTH:     { maxStudents: 1000, maxTeachers: 100, smsEnabled: 1, storageGb: 10 },
  PRO:        { maxStudents: 5000, maxTeachers: 500, smsEnabled: 1, storageGb: 50 },
  ENTERPRISE: { maxStudents: -1,   maxTeachers: -1,  smsEnabled: 1, storageGb: -1 },
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly events: EventPublisher,
  ) {
    const key = config.get<string>('STRIPE_SECRET_KEY', 'sk_test_placeholder');
    this.stripe = new Stripe(key, { apiVersion: '2023-10-16', typescript: true, telemetry: false });
  }

  async createCheckoutSession(tenantId: string, tier: 'GROWTH' | 'PRO' | 'ENTERPRISE'): Promise<any> {
    const priceId = PRICE_MAP[tier];
    if (!priceId) throw new BadRequestException(`Invalid tier: ${tier}`);

    const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
    let customerId = tenant.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripe.customers.create({ email: tenant.email ?? '', metadata: { tenantId } });
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

  async createPortalSession(tenantId: string): Promise<any> {
    const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
    if (!tenant.stripeCustomerId) throw new BadRequestException('No billing account found');

    const session = await this.stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${this.config.get('FRONTEND_URL')}/settings/billing`,
    });
    return { url: session.url };
  }

  async getSubscription(tenantId: string): Promise<any> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { tier: true, status: true, stripeSubId: true, stripeSubscriptionId: true } as any });
    return tenant;
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET'));
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancelled(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        default:
          this.logger.debug(`Unhandled webhook: ${event.type}`);
      }
    } catch (err) {
      this.logger.error(`Webhook error: ${err}`);
      throw new InternalServerErrorException('Webhook processing failed');
    }
  }

  private async handleSubscriptionUpdated(sub: Stripe.Subscription): Promise<void> {
    const tenantId = sub.metadata.tenantId;
    if (!tenantId) return;
    const tier = (sub.metadata.tier || 'GROWTH') as string;
    const limits = PLAN_LIMITS[tier] || PLAN_LIMITS.GROWTH;
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { tier: tier as any, status: sub.status === 'active' ? 'ACTIVE' : 'TRIAL', stripeSubId: sub.id, planLimits: limits },
    });
    await this.events.publishViaOutbox({ tenantId, topic: 'billing.subscription.updated', key: tenantId, payload: { tenantId, tier, status: sub.status } });
  }

  private async handleSubscriptionCancelled(sub: Stripe.Subscription): Promise<void> {
    const tenantId = sub.metadata.tenantId;
    if (!tenantId) return;
    await this.prisma.tenant.update({ where: { id: tenantId }, data: { status: 'CANCELLED' as any, cancelledAt: new Date(), dataRetainUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) } });
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const tenantId = (invoice.subscription_details?.metadata?.tenantId) as string;
    if (!tenantId) return;
    await this.prisma.tenant.update({ where: { id: tenantId }, data: { status: 'ACTIVE', suspendedAt: null } });
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const tenantId = (invoice.subscription_details?.metadata?.tenantId) as string;
    if (!tenantId) return;
    await this.events.publishViaOutbox({ tenantId, topic: 'billing.payment.failed', key: tenantId, payload: { tenantId, invoiceId: invoice.id } });
  }

  async recordUsage(tenantId: string, metric: string, quantity: number): Promise<void> {
    await this.prisma.usageRecord.create({ data: { tenantId, metric, quantity, billingPeriod: new Date().toISOString().slice(0, 7) } });
  }
}
