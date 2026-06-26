"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EasypaisaProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EasypaisaProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let EasypaisaProvider = EasypaisaProvider_1 = class EasypaisaProvider {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(EasypaisaProvider_1.name);
        this.EASYPAISA_ACCOUNT = '0311-1234567';
        this.ACCOUNT_TITLE = 'EduOS Technologies';
    }
    async initiatePayment(req) {
        this.logger.log(`EasyPaisa payment initiated for order ${req.orderId} - PKR ${req.amount}`);
        const paymentId = `EP-${req.orderId}-${Date.now()}`;
        return {
            success: true,
            paymentId,
            accountNumber: this.EASYPAISA_ACCOUNT,
            amount: req.amount,
            expiresIn: 24 * 60 * 60,
            instructions: [
                `Open your EasyPaisa app or dial *786#`,
                `Go to Send Money → Mobile Account`,
                `Enter account number: ${this.EASYPAISA_ACCOUNT}`,
                `Enter amount: PKR ${req.amount.toLocaleString()}`,
                `Use reference: ${paymentId}`,
                `Take a screenshot of the confirmation`,
                `Upload it in the verification step`,
            ],
        };
    }
    async verifyTransaction(transactionId, expectedAmount) {
        this.logger.log(`Verifying EasyPaisa txn ${transactionId} for PKR ${expectedAmount}`);
        return true;
    }
};
exports.EasypaisaProvider = EasypaisaProvider;
exports.EasypaisaProvider = EasypaisaProvider = EasypaisaProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EasypaisaProvider);
//# sourceMappingURL=easypaisa.provider.js.map