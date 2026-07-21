import { IsUUID, IsNumber, IsString, IsOptional, Min, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoiceDto {
  @ApiProperty() @IsUUID() feeStructureId: string;
  @ApiProperty({ type: [String] }) @IsArray() @IsUUID('4', { each: true }) studentIds: string[];
}

export class RecordPaymentDto {
  @ApiProperty() @IsUUID() invoiceId: string;
  @ApiProperty() @IsNumber() @Min(0.01) amount: number;
  @ApiProperty() @IsString() method: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() transactionRef?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}
