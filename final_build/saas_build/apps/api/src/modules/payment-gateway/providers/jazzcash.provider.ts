import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface JazzCashPaymentRequest {
  amount: number;
  orderId: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  returnUrl: string;
}

export interface JazzCashPaymentResponse {
  success: boolean;
  paymentId: string;
  redirectUrl?: string;
  formData?: Record<string, string>;
  instructions: string[];
  mobileAccountNumber: string;
  amount: number;
  expiresIn: number;
}

@Injectable()
export class JazzCashProvider {
  private readonly logger = new Logger(JazzCashProvider.name);

  private readonly JAZZCASH_MOBILE    = '0300-1234567';
  private readonly MERCHANT_ID        = process.env.JAZZCASH_MERCHANT_ID || 'MC12345';
  private readonly PASSWORD           = process.env.JAZZCASH_PASSWORD    || '';
  private readonly INTEGRITY_SALT     = process.env.JAZZCASH_SALT        || '';
  private readonly ACCOUNT_TITLE      = 'EduOS Technologies';

  constructor(private readonly config: ConfigService) {}

  private generateHash(data: string): string {
    return crypto.createHmac('sha256', this.INTEGRITY_SALT).update(data).digest('hex');
  }

  async initiatePayment(req: JazzCashPaymentRequest): Promise<JazzCashPaymentResponse> {
    this.logger.log(`JazzCash payment initiated for order ${req.orderId} - PKR ${req.amount}`);

    const paymentId  = `JC-${req.orderId}-${Date.now()}`;
    const dateTime   = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const expiry     = new Date(Date.now() + 24 * 3600 * 1000).toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const amountCents = (req.amount * 100).toFixed(0);

    const hashData = [
      this.INTEGRITY_SALT,
      amountCents,
      expiry,
      this.MERCHANT_ID,
      req.orderId,
      this.PASSWORD,
      'PKR',
      dateTime,
      'MWALLET',
    ].join('&');

    const hash = this.generateHash(hashData);

    const formData: Record<string, string> = {
      pp_Version:       '1.1',
      pp_TxnType:       'MWALLET',
      pp_Language:      'EN',
      pp_MerchantID:    this.MERCHANT_ID,
      pp_SubMerchantID: '',
      pp_Password:      this.PASSWORD,
      pp_BankID:        'TBANK',
      pp_ProductID:     'RETL',
      pp_TxnRefNo:      req.orderId,
      pp_Amount:        amountCents,
      pp_TxnCurrency:   'PKR',
      pp_TxnDateTime:   dateTime,
      pp_BillReference: paymentId,
      pp_Description:   req.description,
      pp_TxnExpiryDateTime: expiry,
      pp_ReturnURL:     req.returnUrl,
      pp_SecureHash:    hash,
      ppmpf_1:          req.customerEmail,
      ppmpf_2:          req.customerPhone,
    };

    return {
      success: true,
      paymentId,
      formData,
      mobileAccountNumber: this.JAZZCASH_MOBILE,
      amount: req.amount,
      expiresIn: 24 * 60 * 60,
      instructions: [
        `Open your JazzCash app`,
        `Go to Send Money → Mobile Account`,
        `Enter number: ${this.JAZZCASH_MOBILE}`,
        `Enter amount: PKR ${req.amount.toLocaleString()}`,
        `Use description: ${paymentId}`,
        `Screenshot the confirmation & upload below`,
      ],
    };
  }

  async verifyWebhook(payload: Record<string, string>): Promise<boolean> {
    const received = payload.pp_SecureHash;
    const keys     = Object.keys(payload).filter(k => k !== 'pp_SecureHash').sort();
    const data     = keys.map(k => payload[k]).join('&');
    const expected = this.generateHash(data);
    return received === expected;
  }
}
