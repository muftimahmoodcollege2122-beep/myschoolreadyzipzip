import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { EventPublisher } from '../../events/event-publisher.service';
import { EasypaisaProvider } from './providers/easypaisa.provider';
import { JazzCashProvider } from './providers/jazzcash.provider';
import { BankTransferProvider } from './providers/bank-transfer.provider';
import { PayPalProvider } from './providers/paypal.provider';
import { InitiatePaymentDto, VerifyPaymentDto, PaymentMethod, PaymentPlan } from './dto/initiate-payment.dto';

const PLAN_PRICES_PKR: Record<PaymentPlan, number> = {
  [PaymentPlan.STARTER]:      4999,
  [PaymentPlan.PROFESSIONAL]: 12999,
  [PaymentPlan.ENTERPRISE]:   29999,
};

const PLAN_PRICES_USD: Record<PaymentPlan, number> = {
  [PaymentPlan.STARTER]:      18,
  [PaymentPlan.PROFESSIONAL]: 46,
  [PaymentPlan.ENTERPRISE]:   107,
};

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);

  constructor(
    private readonly prisma:        PrismaService,
    private readonly config:        ConfigService,
    private readonly events:        EventPublisher,
    private readonly easypaisa:     EasypaisaProvider,
    private readonly jazzcash:      JazzCashProvider,
    private readonly bankTransfer:  BankTransferProvider,
    private readonly paypal:        PayPalProvider,
  ) {}

  async initiatePayment(dto: InitiatePaymentDto) {
    const amountPKR = PLAN_PRICES_PKR[dto.plan];
    const amountUSD = PLAN_PRICES_USD[dto.plan];
    const orderId   = `${dto.tenantId.slice(0, 8)}-${Date.now()}`;
    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:5000');

    this.logger.log(`Initiating ${dto.method} payment for ${dto.schoolName} — Plan: ${dto.plan}`);

    let result: any;

    switch (dto.method) {
      case PaymentMethod.EASYPAISA:
        result = await this.easypaisa.initiatePayment({
          amount:         amountPKR,
          orderId,
          customerEmail:  dto.email,
          customerPhone:  dto.phone || '',
          description:    `EduOS ${dto.plan} Plan — ${dto.schoolName}`,
        });
        break;

      case PaymentMethod.JAZZCASH:
        result = await this.jazzcash.initiatePayment({
          amount:         amountPKR,
          orderId,
          customerEmail:  dto.email,
          customerPhone:  dto.phone || '',
          description:    `EduOS ${dto.plan} Plan — ${dto.schoolName}`,
          returnUrl:      `${frontendUrl}/payment/verify?method=jazzcash&orderId=${orderId}`,
        });
        break;

      case PaymentMethod.BANK_TRANSFER:
        result = await this.bankTransfer.initiateBankTransfer({
          amount:       amountPKR,
          orderId,
          customerEmail: dto.email,
          customerName:  dto.schoolName,
          description:  `EduOS ${dto.plan} Plan`,
        });
        break;

      case PaymentMethod.IBAN:
        result = await this.bankTransfer.initiateIBANTransfer({
          amount:       amountPKR,
          orderId,
          customerEmail: dto.email,
          customerName:  dto.schoolName,
          description:  `EduOS ${dto.plan} Plan`,
          iban:         dto.senderAccount || '',
        });
        break;

      case PaymentMethod.PAYPAL:
        result = await this.paypal.createOrder({
          amount:        amountUSD,
          currency:      'USD',
          orderId,
          customerEmail: dto.email,
          description:   `EduOS ${dto.plan} Plan — ${dto.schoolName}`,
          returnUrl:     `${frontendUrl}/payment/verify?method=paypal&orderId=${orderId}`,
          cancelUrl:     `${frontendUrl}/payment/cancelled`,
        });
        break;

      default:
        throw new BadRequestException(`Unsupported payment method: ${dto.method}`);
    }

    await this.prisma.outboxEvent.create({
      data: {
        tenantId:  dto.tenantId,
        topic:     'payment.initiated',
        key:       orderId,
        payload:   {
          orderId, method: dto.method, plan: dto.plan,
          amountPKR, tenantId: dto.tenantId, email: dto.email,
          schoolName: dto.schoolName, paymentId: result.paymentId,
        },
        headers:   { source: 'payment-gateway' },
        status:    'PENDING',
      },
    });

    return {
      orderId,
      method:     dto.method,
      plan:       dto.plan,
      amountPKR,
      amountUSD,
      ...result,
    };
  }

  async verifyPayment(dto: VerifyPaymentDto) {
    this.logger.log(`Verifying payment ${dto.paymentId} with txn ${dto.transactionId}`);

    const outbox = await this.prisma.outboxEvent.findFirst({
      where: {
        eventType: 'payment.initiated',
        payload: { string_contains: dto.paymentId },
      },
    });

    if (!outbox) throw new NotFoundException('Payment record not found');

    const payload = outbox.payload as any;

    await this.prisma.outboxEvent.create({
      data: {
        tenantId:  payload.tenantId,
        topic:     'payment.verified',
        key:       dto.paymentId,
        payload:   {
          ...payload,
          transactionId:   dto.transactionId,
          screenshotUrl:   dto.screenshot,
          verifiedAt:      new Date().toISOString(),
          status:          'PENDING_REVIEW',
        },
        headers:   { source: 'payment-gateway' },
        status:    'PENDING',
      },
    });

    await this.events.publishDirect({
      topic: 'payment.verified',
      key: payload.tenantId,
      tenantId: payload.tenantId,
      payload: {
        tenantId:      payload.tenantId,
        plan:          payload.plan,
        method:        payload.method,
        transactionId: dto.transactionId,
        email:         payload.email,
      },
    });

    return {
      success: true,
      message: 'Payment proof submitted. Your school account will be activated within 2-4 hours.',
      status:  'PENDING_REVIEW',
    };
  }

  async capturePayPal(paypalOrderId: string, internalOrderId: string) {
    const capture = await this.paypal.captureOrder(paypalOrderId);

    if (capture.success) {
      const outbox = await this.prisma.outboxEvent.findFirst({
        where: { topic: 'payment.initiated', key: { contains: internalOrderId } },
      });

      if (outbox) {
        const payload = outbox.payload as any;
        await this.events.publishDirect({
          topic: 'payment.confirmed',
          key: payload.tenantId,
          tenantId: payload.tenantId,
          payload: {
            tenantId:  payload.tenantId,
            plan:      payload.plan,
            method:    PaymentMethod.PAYPAL,
            captureId: capture.captureId,
            email:     payload.email,
          },
        });

        await this.prisma.tenant.update({
          where: { id: payload.tenantId },
          data:  { status: 'ACTIVE' },
        });
      }
    }

    return capture;
  }

  async handleJazzCashWebhook(payload: Record<string, string>) {
    const isValid = await this.jazzcash.verifyWebhook(payload);
    if (!isValid) throw new BadRequestException('Invalid JazzCash webhook signature');

    if (payload.pp_ResponseCode === '000') {
      const orderId = payload.pp_TxnRefNo;
      this.logger.log(`JazzCash payment confirmed for order ${orderId}`);

      const outbox = await this.prisma.outboxEvent.findFirst({
        where: { topic: 'payment.initiated', key: { contains: orderId } },
      });

      if (outbox) {
        const data = outbox.payload as any;
        await this.events.publishDirect({
          topic: 'payment.confirmed',
          key: data.tenantId,
          tenantId: data.tenantId,
          payload: {
            tenantId:      data.tenantId,
            plan:          data.plan,
            method:        PaymentMethod.JAZZCASH,
            transactionId: payload.pp_TxnRefNo,
            email:         data.email,
          },
        });

        await this.prisma.tenant.update({
          where: { id: data.tenantId },
          data:  { status: 'ACTIVE' },
        });
      }
    }

    return { success: true };
  }

  async getPendingVerifications() {
    const events = await this.prisma.outboxEvent.findMany({
      where: { topic: 'payment.verified', status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
    return events.map(e => ({ id: e.id, ...JSON.parse(e.payload as string) }));
  }

  async approveManualPayment(outboxId: string) {
    const outbox = await this.prisma.outboxEvent.findUniqueOrThrow({ where: { id: outboxId } });
    const payload = outbox.payload as any;

    await this.prisma.tenant.update({
      where: { id: payload.tenantId },
      data:  { status: 'ACTIVE' },
    });

    await this.prisma.outboxEvent.update({
      where: { id: outboxId },
      data:  { status: 'SENT', sentAt: new Date() },
    });

    await this.events.publishDirect({ topic: 'payment.confirmed', key: 'payment', tenantId: '', payload: { ...payload, approvedManually: true });

    return { success: true, message: `Tenant ${payload.tenantId} activated` };
  }

  getPlanPrices() {
    return Object.entries(PLAN_PRICES_PKR).map(([plan, pkr]) => ({
      plan,
      pkr,
      usd: PLAN_PRICES_USD[plan as PaymentPlan],
    }));
  }
}
