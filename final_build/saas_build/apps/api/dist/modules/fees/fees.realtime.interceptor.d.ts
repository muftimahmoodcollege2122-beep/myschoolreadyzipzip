import { RealtimeService } from '../../realtime/realtime.service';
export declare class FeesRealtimeInterceptor {
    private readonly realtime;
    constructor(realtime: RealtimeService);
    afterPaymentRecorded(tenantId: string, payload: {
        invoiceId: string;
        studentId: string;
        studentName: string;
        amount: number;
        paymentMethod: string;
        receiptNumber: string;
    }): Promise<void>;
}
