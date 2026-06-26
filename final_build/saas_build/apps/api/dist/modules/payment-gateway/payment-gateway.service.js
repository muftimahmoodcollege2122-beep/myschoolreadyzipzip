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
var PaymentGatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../database/prisma.service");
const event_publisher_service_1 = require("../../events/event-publisher.service");
const easypaisa_provider_1 = require("./providers/easypaisa.provider");
const jazzcash_provider_1 = require("./providers/jazzcash.provider");
const bank_transfer_provider_1 = require("./providers/bank-transfer.provider");
const paypal_provider_1 = require("./providers/paypal.provider");
const initiate_payment_dto_1 = require("./dto/initiate-payment.dto");
const PLAN_PRICES_PKR = {
    [initiate_payment_dto_1.PaymentPlan.STARTER]: 4999,
    [initiate_payment_dto_1.PaymentPlan.PROFESSIONAL]: 12999,
    [initiate_payment_dto_1.PaymentPlan.ENTERPRISE]: 29999,
};
const PLAN_PRICES_USD = {
    [initiate_payment_dto_1.PaymentPlan.STARTER]: 18,
    [initiate_payment_dto_1.PaymentPlan.PROFESSIONAL]: 46,
    [initiate_payment_dto_1.PaymentPlan.ENTERPRISE]: 107,
};
let PaymentGatewayService = PaymentGatewayService_1 = class PaymentGatewayService {
    constructor(prisma, config, events, easypaisa, jazzcash, bankTransfer, paypal) {
        this.prisma = prisma;
        this.config = config;
        this.events = events;
        this.easypaisa = easypaisa;
        this.jazzcash = jazzcash;
        this.bankTransfer = bankTransfer;
        this.paypal = paypal;
        this.logger = new common_1.Logger(PaymentGatewayService_1.name);
    }
    async initiatePayment(dto) {
        const amountPKR = PLAN_PRICES_PKR[dto.plan];
        const amountUSD = PLAN_PRICES_USD[dto.plan];
        const orderId = `${dto.tenantId.slice(0, 8)}-${Date.now()}`;
        const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:5000');
        this.logger.log(`Initiating ${dto.method} payment for ${dto.schoolName} — Plan: ${dto.plan}`);
        let result;
        switch (dto.method) {
            case initiate_payment_dto_1.PaymentMethod.EASYPAISA:
                result = await this.easypaisa.initiatePayment({
                    amount: amountPKR,
                    orderId,
                    customerEmail: dto.email,
                    customerPhone: dto.phone || '',
                    description: `EduOS ${dto.plan} Plan — ${dto.schoolName}`,
                });
                break;
            case initiate_payment_dto_1.PaymentMethod.JAZZCASH:
                result = await this.jazzcash.initiatePayment({
                    amount: amountPKR,
                    orderId,
                    customerEmail: dto.email,
                    customerPhone: dto.phone || '',
                    description: `EduOS ${dto.plan} Plan — ${dto.schoolName}`,
                    returnUrl: `${frontendUrl}/payment/verify?method=jazzcash&orderId=${orderId}`,
                });
                break;
            case initiate_payment_dto_1.PaymentMethod.BANK_TRANSFER:
                result = await this.bankTransfer.initiateBankTransfer({
                    amount: amountPKR,
                    orderId,
                    customerEmail: dto.email,
                    customerName: dto.schoolName,
                    description: `EduOS ${dto.plan} Plan`,
                });
                break;
            case initiate_payment_dto_1.PaymentMethod.IBAN:
                result = await this.bankTransfer.initiateIBANTransfer({
                    amount: amountPKR,
                    orderId,
                    customerEmail: dto.email,
                    customerName: dto.schoolName,
                    description: `EduOS ${dto.plan} Plan`,
                    iban: dto.senderAccount || '',
                });
                break;
            case initiate_payment_dto_1.PaymentMethod.PAYPAL:
                result = await this.paypal.createOrder({
                    amount: amountUSD,
                    currency: 'USD',
                    orderId,
                    customerEmail: dto.email,
                    description: `EduOS ${dto.plan} Plan — ${dto.schoolName}`,
                    returnUrl: `${frontendUrl}/payment/verify?method=paypal&orderId=${orderId}`,
                    cancelUrl: `${frontendUrl}/payment/cancelled`,
                });
                break;
            default:
                throw new common_1.BadRequestException(`Unsupported payment method: ${dto.method}`);
        }
        await this.prisma.outboxEvent.create({
            data: {
                tenantId: dto.tenantId,
                topic: 'payment.initiated',
                key: orderId,
                payload: {
                    orderId, method: dto.method, plan: dto.plan,
                    amountPKR, tenantId: dto.tenantId, email: dto.email,
                    schoolName: dto.schoolName, paymentId: result.paymentId,
                },
                headers: { source: 'payment-gateway' },
                status: 'PENDING',
            },
        });
        return {
            orderId,
            method: dto.method,
            plan: dto.plan,
            amountPKR,
            amountUSD,
            ...result,
        };
    }
    async verifyPayment(dto) {
        this.logger.log(`Verifying payment ${dto.paymentId} with txn ${dto.transactionId}`);
        const outbox = await this.prisma.outboxEvent.findFirst({
            where: {
                eventType: 'payment.initiated',
                payload: { string_contains: dto.paymentId },
            },
        });
        if (!outbox)
            throw new common_1.NotFoundException('Payment record not found');
        const payload = outbox.payload;
        await this.prisma.outboxEvent.create({
            data: {
                tenantId: payload.tenantId,
                topic: 'payment.verified',
                key: dto.paymentId,
                payload: {
                    ...payload,
                    transactionId: dto.transactionId,
                    screenshotUrl: dto.screenshot,
                    verifiedAt: new Date().toISOString(),
                    status: 'PENDING_REVIEW',
                },
                headers: { source: 'payment-gateway' },
                status: 'PENDING',
            },
        });
        await this.events.publishDirect({
            topic: 'payment.verified',
            key: payload.tenantId,
            tenantId: payload.tenantId,
            payload: {
                tenantId: payload.tenantId,
                plan: payload.plan,
                method: payload.method,
                transactionId: dto.transactionId,
                email: payload.email,
            },
        });
        return {
            success: true,
            message: 'Payment proof submitted. Your school account will be activated within 2-4 hours.',
            status: 'PENDING_REVIEW',
        };
    }
    async capturePayPal(paypalOrderId, internalOrderId) {
        const capture = await this.paypal.captureOrder(paypalOrderId);
        if (capture.success) {
            const outbox = await this.prisma.outboxEvent.findFirst({
                where: { topic: 'payment.initiated', key: { contains: internalOrderId } },
            });
            if (outbox) {
                const payload = outbox.payload;
                await this.events.publishDirect({
                    topic: 'payment.confirmed',
                    key: payload.tenantId,
                    tenantId: payload.tenantId,
                    payload: {
                        tenantId: payload.tenantId,
                        plan: payload.plan,
                        method: initiate_payment_dto_1.PaymentMethod.PAYPAL,
                        captureId: capture.captureId,
                        email: payload.email,
                    },
                });
                await this.prisma.tenant.update({
                    where: { id: payload.tenantId },
                    data: { status: 'ACTIVE' },
                });
            }
        }
        return capture;
    }
    async handleJazzCashWebhook(payload) {
        const isValid = await this.jazzcash.verifyWebhook(payload);
        if (!isValid)
            throw new common_1.BadRequestException('Invalid JazzCash webhook signature');
        if (payload.pp_ResponseCode === '000') {
            const orderId = payload.pp_TxnRefNo;
            this.logger.log(`JazzCash payment confirmed for order ${orderId}`);
            const outbox = await this.prisma.outboxEvent.findFirst({
                where: { topic: 'payment.initiated', key: { contains: orderId } },
            });
            if (outbox) {
                const data = outbox.payload;
                await this.events.publishDirect({
                    topic: 'payment.confirmed',
                    key: data.tenantId,
                    tenantId: data.tenantId,
                    payload: {
                        tenantId: data.tenantId,
                        plan: data.plan,
                        method: initiate_payment_dto_1.PaymentMethod.JAZZCASH,
                        transactionId: payload.pp_TxnRefNo,
                        email: data.email,
                    },
                });
                await this.prisma.tenant.update({
                    where: { id: data.tenantId },
                    data: { status: 'ACTIVE' },
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
        return events.map(e => ({ id: e.id, ...JSON.parse(e.payload) }));
    }
    async approveManualPayment(outboxId) {
        const outbox = await this.prisma.outboxEvent.findUniqueOrThrow({ where: { id: outboxId } });
        const payload = outbox.payload;
        await this.prisma.tenant.update({
            where: { id: payload.tenantId },
            data: { status: 'ACTIVE' },
        });
        await this.prisma.outboxEvent.update({
            where: { id: outboxId },
            data: { status: 'SENT', sentAt: new Date() },
        });
        await this.events.publishDirect({ topic: 'payment.confirmed', key: 'payment', tenantId: '', payload: { ...payload, approvedManually: true } });
        return { success: true, message: `Tenant ${payload.tenantId} activated` };
    }
    getPlanPrices() {
        return Object.entries(PLAN_PRICES_PKR).map(([plan, pkr]) => ({
            plan,
            pkr,
            usd: PLAN_PRICES_USD[plan],
        }));
    }
};
exports.PaymentGatewayService = PaymentGatewayService;
exports.PaymentGatewayService = PaymentGatewayService = PaymentGatewayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        event_publisher_service_1.EventPublisher,
        easypaisa_provider_1.EasypaisaProvider,
        jazzcash_provider_1.JazzCashProvider,
        bank_transfer_provider_1.BankTransferProvider,
        paypal_provider_1.PayPalProvider])
], PaymentGatewayService);
//# sourceMappingURL=payment-gateway.service.js.map