import { FeesService } from './fees.service';
import { CreateInvoiceDto, RecordPaymentDto } from './dto/create-invoice.dto';
export declare class FeesController {
    private readonly svc;
    constructor(svc: FeesService);
    createInvoice(dto: CreateInvoiceDto, tid: string): Promise<any>;
    createDirectInvoice(dto: any, tid: string): Promise<any>;
    recordPayment(dto: RecordPaymentDto & {
        invoiceId: string;
    }, tid: string, u: any): Promise<void>;
    studentFees(id: string, tid: string): Promise<any>;
    revenue(sid: string, m: number, y: number, tid: string): Promise<any>;
    outstanding(sid: string, tid: string): Promise<any[]>;
}
