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
export declare class BankTransferProvider {
    private readonly logger;
    private readonly BANK_ACCOUNTS;
    initiateBankTransfer(req: BankTransferRequest): Promise<BankTransferResponse>;
    initiateIBANTransfer(req: BankTransferRequest & {
        iban: string;
    }): Promise<BankTransferResponse>;
}
