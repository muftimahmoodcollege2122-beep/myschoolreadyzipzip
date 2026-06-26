export declare class CreateInvoiceDto {
    feeStructureId: string;
    studentIds: string[];
}
export declare class RecordPaymentDto {
    invoiceId: string;
    amount: number;
    method: string;
    transactionRef?: string;
    notes?: string;
}
