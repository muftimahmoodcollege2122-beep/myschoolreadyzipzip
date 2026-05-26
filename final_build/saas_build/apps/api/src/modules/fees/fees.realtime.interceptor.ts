import { Injectable } from '@nestjs/common';
import { RealtimeService } from '../../realtime/realtime.service';

@Injectable()
export class FeesRealtimeInterceptor {
  constructor(private readonly realtime: RealtimeService) {}

  async afterPaymentRecorded(
    tenantId: string,
    payload: {
      invoiceId: string;
      studentId: string;
      studentName: string;
      amount: number;
      paymentMethod: string;
      receiptNumber: string;
    },
  ) {
    await this.realtime.onFeePaymentRecorded(tenantId, payload);
  }
}
