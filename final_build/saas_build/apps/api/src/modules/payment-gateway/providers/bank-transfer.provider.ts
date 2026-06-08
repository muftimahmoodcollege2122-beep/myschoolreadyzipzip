import { Injectable, Logger } from '@nestjs/common';

export interface BankTransferRequest {
  amount: number;
  orderId: string;
  customerEmail: string;
  customerName: string;
  description: string;
}

export interface BankAccount {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  branchCode: string;
  swiftCode?: string;
}

export interface BankTransferResponse {
  success: boolean;
  paymentId: string;
  accounts: BankAccount[];
  amount: number;
  currency: string;
  referenceCode: string;
  instructions: string[];
  expiresIn: number;
}

@Injectable()
export class BankTransferProvider {
  private readonly logger = new Logger(BankTransferProvider.name);

  private readonly BANK_ACCOUNTS: BankAccount[] = [
    {
      bankName:      'HBL (Habib Bank Limited)',
      accountTitle:  'EduOS Technologies Pvt Ltd',
      accountNumber: '12345678901234',
      iban:          'PK36HABB0000012345678901',
      branchCode:    '0001',
      swiftCode:     'HABBPKKA',
    },
    {
      bankName:      'Meezan Bank',
      accountTitle:  'EduOS Technologies Pvt Ltd',
      accountNumber: '98765432109876',
      iban:          'PK70MEZN0001234567890000',
      branchCode:    '0325',
    },
    {
      bankName:      'UBL (United Bank Limited)',
      accountTitle:  'EduOS Technologies Pvt Ltd',
      accountNumber: '11122233344455',
      iban:          'PK24UNIL0010001234567891',
      branchCode:    '1234',
      swiftCode:     'UNILPKKA',
    },
  ];

  async initiateBankTransfer(req: BankTransferRequest): Promise<BankTransferResponse> {
    this.logger.log(`Bank transfer initiated for order ${req.orderId} - PKR ${req.amount}`);

    const paymentId     = `BT-${req.orderId}-${Date.now()}`;
    const referenceCode = `EDUOS-${req.orderId.slice(-6).toUpperCase()}`;

    return {
      success: true,
      paymentId,
      referenceCode,
      accounts:  this.BANK_ACCOUNTS,
      amount:    req.amount,
      currency:  'PKR',
      expiresIn: 48 * 60 * 60,
      instructions: [
        `Transfer PKR ${req.amount.toLocaleString()} to any of the bank accounts listed below`,
        `Use reference code "${referenceCode}" in the transfer description/narration`,
        `Keep your transfer receipt/screenshot`,
        `Upload proof of payment below to activate your account`,
        `Your account will be activated within 2-4 business hours after verification`,
      ],
    };
  }

  async initiateIBANTransfer(req: BankTransferRequest & { iban: string }): Promise<BankTransferResponse> {
    this.logger.log(`IBAN transfer initiated for order ${req.orderId} to ${req.iban}`);
    const paymentId     = `IBAN-${req.orderId}-${Date.now()}`;
    const referenceCode = `EDUOS-${req.orderId.slice(-6).toUpperCase()}`;

    return {
      success: true,
      paymentId,
      referenceCode,
      accounts:  this.BANK_ACCOUNTS,
      amount:    req.amount,
      currency:  'PKR',
      expiresIn: 48 * 60 * 60,
      instructions: [
        `Initiate an IBAN transfer from your internet banking`,
        `IBAN: PK36HABB0000012345678901 (HBL)`,
        `Account Title: EduOS Technologies Pvt Ltd`,
        `Amount: PKR ${req.amount.toLocaleString()}`,
        `Narration: ${referenceCode}`,
        `Upload payment proof below for quick activation`,
      ],
    };
  }
}
