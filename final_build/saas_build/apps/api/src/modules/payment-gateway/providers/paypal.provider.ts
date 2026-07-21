import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
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

@Injectable()
export class PayPalProvider {
  private readonly logger = new Logger(PayPalProvider.name);

  private readonly BASE_URL: string;
  private readonly CLIENT_ID: string;
  private readonly CLIENT_SECRET: string;

  constructor(private readonly config: ConfigService) {
    const isSandbox    = config.get('PAYPAL_ENV', 'sandbox') === 'sandbox';
    this.BASE_URL      = isSandbox
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';
    this.CLIENT_ID     = config.get('PAYPAL_CLIENT_ID', '');
    this.CLIENT_SECRET = config.get('PAYPAL_CLIENT_SECRET', '');
  }

  private async getAccessToken(): Promise<string> {
    if (!this.CLIENT_ID || !this.CLIENT_SECRET) {
      throw new InternalServerErrorException('PayPal credentials not configured');
    }

    const credentials = Buffer.from(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`).toString('base64');
    const res = await fetch(`${this.BASE_URL}/v1/oauth2/token`, {
      method:  'POST',
      headers: {
        Authorization:  `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) throw new InternalServerErrorException('Failed to get PayPal token');
    const data = await res.json() as any;
    return data.access_token;
  }

  async createOrder(req: PayPalPaymentRequest): Promise<PayPalPaymentResponse> {
    this.logger.log(`PayPal order created for ${req.orderId} - ${req.currency} ${req.amount}`);

    const amountUSD = (req.amount / 280).toFixed(2);

    try {
      const token = await this.getAccessToken();

      const res = await fetch(`${this.BASE_URL}/v2/checkout/orders`, {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: req.orderId,
            description:  req.description,
            amount: {
              currency_code: 'USD',
              value:         amountUSD,
            },
          }],
          application_context: {
            return_url:    req.returnUrl,
            cancel_url:    req.cancelUrl,
            brand_name:    'EduOS School Management',
            user_action:   'PAY_NOW',
            shipping_preference: 'NO_SHIPPING',
          },
        }),
      });

      if (!res.ok) throw new InternalServerErrorException('PayPal order creation failed');
      const order = await res.json() as any;

      const approvalLink = order.links?.find((l: any) => l.rel === 'approve')?.href;

      return {
        success:     true,
        paymentId:   `PP-${req.orderId}-${Date.now()}`,
        approvalUrl: approvalLink || `${this.BASE_URL}/checkoutnow?token=${order.id}`,
        orderId:     order.id,
        amount:      req.amount,
        currency:    'PKR',
      };
    } catch (err) {
      this.logger.error('PayPal order creation error', err);
      throw new InternalServerErrorException('PayPal payment could not be initiated');
    }
  }

  async captureOrder(paypalOrderId: string): Promise<{ success: boolean; captureId: string; status: string }> {
    const token = await this.getAccessToken();

    const res = await fetch(`${this.BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new InternalServerErrorException('PayPal capture failed');
    const data = await res.json() as any;

    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
    return {
      success:   data.status === 'COMPLETED',
      captureId: capture?.id || '',
      status:    data.status,
    };
  }
}
