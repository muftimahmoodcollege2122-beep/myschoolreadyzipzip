"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JazzCashProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JazzCashProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
let JazzCashProvider = JazzCashProvider_1 = class JazzCashProvider {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(JazzCashProvider_1.name);
        this.JAZZCASH_MOBILE = '0300-1234567';
        this.MERCHANT_ID = process.env.JAZZCASH_MERCHANT_ID || 'MC12345';
        this.PASSWORD = process.env.JAZZCASH_PASSWORD || '';
        this.INTEGRITY_SALT = process.env.JAZZCASH_SALT || '';
        this.ACCOUNT_TITLE = 'EduOS Technologies';
    }
    generateHash(data) {
        return crypto.createHmac('sha256', this.INTEGRITY_SALT).update(data).digest('hex');
    }
    async initiatePayment(req) {
        this.logger.log(`JazzCash payment initiated for order ${req.orderId} - PKR ${req.amount}`);
        const paymentId = `JC-${req.orderId}-${Date.now()}`;
        const dateTime = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
        const expiry = new Date(Date.now() + 24 * 3600 * 1000).toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
        const amountCents = (req.amount * 100).toFixed(0);
        const hashData = [
            this.INTEGRITY_SALT,
            amountCents,
            expiry,
            this.MERCHANT_ID,
            req.orderId,
            this.PASSWORD,
            'PKR',
            dateTime,
            'MWALLET',
        ].join('&');
        const hash = this.generateHash(hashData);
        const formData = {
            pp_Version: '1.1',
            pp_TxnType: 'MWALLET',
            pp_Language: 'EN',
            pp_MerchantID: this.MERCHANT_ID,
            pp_SubMerchantID: '',
            pp_Password: this.PASSWORD,
            pp_BankID: 'TBANK',
            pp_ProductID: 'RETL',
            pp_TxnRefNo: req.orderId,
            pp_Amount: amountCents,
            pp_TxnCurrency: 'PKR',
            pp_TxnDateTime: dateTime,
            pp_BillReference: paymentId,
            pp_Description: req.description,
            pp_TxnExpiryDateTime: expiry,
            pp_ReturnURL: req.returnUrl,
            pp_SecureHash: hash,
            ppmpf_1: req.customerEmail,
            ppmpf_2: req.customerPhone,
        };
        return {
            success: true,
            paymentId,
            formData,
            mobileAccountNumber: this.JAZZCASH_MOBILE,
            amount: req.amount,
            expiresIn: 24 * 60 * 60,
            instructions: [
                `Open your JazzCash app`,
                `Go to Send Money → Mobile Account`,
                `Enter number: ${this.JAZZCASH_MOBILE}`,
                `Enter amount: PKR ${req.amount.toLocaleString()}`,
                `Use description: ${paymentId}`,
                `Screenshot the confirmation & upload below`,
            ],
        };
    }
    async verifyWebhook(payload) {
        const received = payload.pp_SecureHash;
        const keys = Object.keys(payload).filter(k => k !== 'pp_SecureHash').sort();
        const data = keys.map(k => payload[k]).join('&');
        const expected = this.generateHash(data);
        return received === expected;
    }
};
exports.JazzCashProvider = JazzCashProvider;
exports.JazzCashProvider = JazzCashProvider = JazzCashProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], JazzCashProvider);
//# sourceMappingURL=jazzcash.provider.js.map