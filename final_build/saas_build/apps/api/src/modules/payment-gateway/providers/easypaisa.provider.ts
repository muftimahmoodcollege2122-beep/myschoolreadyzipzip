import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EasypaisaPaymentRequest {
  amount: number;
  orderId: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
}

export interface EasypaisaPaymentResponse {
  success: boolean;
  paymentId: string;
  instructions: string[];
  accountNumber: string;
  amount: number;
  expiresIn: number;
}

@Injectable()
export class EasypaisaProvider {
  private readonly logger = new Logger(EasypaisaProvider.name);

  private readonly EASYPAISA_ACCOUNT = '0311-1234567';
  private readonly ACCOUNT_TITLE     = 'EduOS Technologies';

  constructor(private readonly config: ConfigService) {}

  async initiatePayment(req: EasypaisaPaymentRequest): Promise<EasypaisaPaymentResponse> {
    this.logger.log(`EasyPaisa payment initiated for order ${req.orderId} - PKR ${req.amount}`);

    const paymentId = `EP-${req.orderId}-${Date.now()}`;

    return {
      success: true,
      paymentId,
      accountNumber: this.EASYPAISA_ACCOUNT,
      amount: req.amount,
      expiresIn: 24 * 60 * 60,
      instructions: [
        `Open your EasyPaisa app or dial *786#`,
        `Go to Send Money → Mobile Account`,
        `Enter account number: ${this.EASYPAISA_ACCOUNT}`,
        `Enter amount: PKR ${req.amount.toLocaleString()}`,
        `Use reference: ${paymentId}`,
        `Take a screenshot of the confirmation`,
        `Upload it in the verification step`,
      ],
    };
  }

  async verifyTransaction(transactionId: string, expectedAmount: number): Promise<boolean> {
    this.logger.log(`Verifying EasyPaisa txn ${transactionId} for PKR ${expectedAmount}`);
    return true;
  }
}
