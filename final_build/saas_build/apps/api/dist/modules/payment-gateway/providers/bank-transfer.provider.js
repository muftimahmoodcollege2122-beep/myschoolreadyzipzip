"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BankTransferProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankTransferProvider = void 0;
const common_1 = require("@nestjs/common");
let BankTransferProvider = BankTransferProvider_1 = class BankTransferProvider {
    constructor() {
        this.logger = new common_1.Logger(BankTransferProvider_1.name);
        this.BANK_ACCOUNTS = [
            {
                bankName: 'HBL (Habib Bank Limited)',
                accountTitle: 'EduOS Technologies Pvt Ltd',
                accountNumber: '12345678901234',
                iban: 'PK36HABB0000012345678901',
                branchCode: '0001',
                swiftCode: 'HABBPKKA',
            },
            {
                bankName: 'Meezan Bank',
                accountTitle: 'EduOS Technologies Pvt Ltd',
                accountNumber: '98765432109876',
                iban: 'PK70MEZN0001234567890000',
                branchCode: '0325',
            },
            {
                bankName: 'UBL (United Bank Limited)',
                accountTitle: 'EduOS Technologies Pvt Ltd',
                accountNumber: '11122233344455',
                iban: 'PK24UNIL0010001234567891',
                branchCode: '1234',
                swiftCode: 'UNILPKKA',
            },
        ];
    }
    async initiateBankTransfer(req) {
        this.logger.log(`Bank transfer initiated for order ${req.orderId} - PKR ${req.amount}`);
        const paymentId = `BT-${req.orderId}-${Date.now()}`;
        const referenceCode = `EDUOS-${req.orderId.slice(-6).toUpperCase()}`;
        return {
            success: true,
            paymentId,
            referenceCode,
            accounts: this.BANK_ACCOUNTS,
            amount: req.amount,
            currency: 'PKR',
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
    async initiateIBANTransfer(req) {
        this.logger.log(`IBAN transfer initiated for order ${req.orderId} to ${req.iban}`);
        const paymentId = `IBAN-${req.orderId}-${Date.now()}`;
        const referenceCode = `EDUOS-${req.orderId.slice(-6).toUpperCase()}`;
        return {
            success: true,
            paymentId,
            referenceCode,
            accounts: this.BANK_ACCOUNTS,
            amount: req.amount,
            currency: 'PKR',
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
};
exports.BankTransferProvider = BankTransferProvider;
exports.BankTransferProvider = BankTransferProvider = BankTransferProvider_1 = __decorate([
    (0, common_1.Injectable)()
], BankTransferProvider);
//# sourceMappingURL=bank-transfer.provider.js.map