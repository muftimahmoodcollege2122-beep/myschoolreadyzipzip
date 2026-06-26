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
var PayPalProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayPalProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let PayPalProvider = PayPalProvider_1 = class PayPalProvider {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(PayPalProvider_1.name);
        const isSandbox = config.get('PAYPAL_ENV', 'sandbox') === 'sandbox';
        this.BASE_URL = isSandbox
            ? 'https://api-m.sandbox.paypal.com'
            : 'https://api-m.paypal.com';
        this.CLIENT_ID = config.get('PAYPAL_CLIENT_ID', '');
        this.CLIENT_SECRET = config.get('PAYPAL_CLIENT_SECRET', '');
    }
    async getAccessToken() {
        if (!this.CLIENT_ID || !this.CLIENT_SECRET) {
            throw new common_1.InternalServerErrorException('PayPal credentials not configured');
        }
        const credentials = Buffer.from(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`).toString('base64');
        const res = await fetch(`${this.BASE_URL}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });
        if (!res.ok)
            throw new common_1.InternalServerErrorException('Failed to get PayPal token');
        const data = await res.json();
        return data.access_token;
    }
    async createOrder(req) {
        this.logger.log(`PayPal order created for ${req.orderId} - ${req.currency} ${req.amount}`);
        const amountUSD = (req.amount / 280).toFixed(2);
        try {
            const token = await this.getAccessToken();
            const res = await fetch(`${this.BASE_URL}/v2/checkout/orders`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    intent: 'CAPTURE',
                    purchase_units: [{
                            reference_id: req.orderId,
                            description: req.description,
                            amount: {
                                currency_code: 'USD',
                                value: amountUSD,
                            },
                        }],
                    application_context: {
                        return_url: req.returnUrl,
                        cancel_url: req.cancelUrl,
                        brand_name: 'EduOS School Management',
                        user_action: 'PAY_NOW',
                        shipping_preference: 'NO_SHIPPING',
                    },
                }),
            });
            if (!res.ok)
                throw new common_1.InternalServerErrorException('PayPal order creation failed');
            const order = await res.json();
            const approvalLink = order.links?.find((l) => l.rel === 'approve')?.href;
            return {
                success: true,
                paymentId: `PP-${req.orderId}-${Date.now()}`,
                approvalUrl: approvalLink || `${this.BASE_URL}/checkoutnow?token=${order.id}`,
                orderId: order.id,
                amount: req.amount,
                currency: 'PKR',
            };
        }
        catch (err) {
            this.logger.error('PayPal order creation error', err);
            throw new common_1.InternalServerErrorException('PayPal payment could not be initiated');
        }
    }
    async captureOrder(paypalOrderId) {
        const token = await this.getAccessToken();
        const res = await fetch(`${this.BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok)
            throw new common_1.InternalServerErrorException('PayPal capture failed');
        const data = await res.json();
        const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
        return {
            success: data.status === 'COMPLETED',
            captureId: capture?.id || '',
            status: data.status,
        };
    }
};
exports.PayPalProvider = PayPalProvider;
exports.PayPalProvider = PayPalProvider = PayPalProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PayPalProvider);
//# sourceMappingURL=paypal.provider.js.map