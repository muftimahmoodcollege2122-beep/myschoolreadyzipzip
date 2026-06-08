import { IsEnum, IsNumber, IsString, IsOptional, IsEmail, Min } from 'class-validator';

export enum PaymentMethod {
  EASYPAISA   = 'EASYPAISA',
  JAZZCASH    = 'JAZZCASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  IBAN        = 'IBAN',
  PAYPAL      = 'PAYPAL',
}

export enum PaymentPlan {
  STARTER    = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export class InitiatePaymentDto {
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsEnum(PaymentPlan)
  plan: PaymentPlan;

  @IsString()
  tenantId: string;

  @IsEmail()
  email: string;

  @IsString()
  schoolName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  senderAccount?: string;
}

export class VerifyPaymentDto {
  @IsString()
  paymentId: string;

  @IsString()
  transactionId: string;

  @IsOptional()
  @IsString()
  screenshot?: string;
}
