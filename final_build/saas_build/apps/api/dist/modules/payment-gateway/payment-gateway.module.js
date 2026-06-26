"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayModule = void 0;
const common_1 = require("@nestjs/common");
const payment_gateway_controller_1 = require("./payment-gateway.controller");
const payment_gateway_service_1 = require("./payment-gateway.service");
const easypaisa_provider_1 = require("./providers/easypaisa.provider");
const jazzcash_provider_1 = require("./providers/jazzcash.provider");
const bank_transfer_provider_1 = require("./providers/bank-transfer.provider");
const paypal_provider_1 = require("./providers/paypal.provider");
const prisma_service_1 = require("../../database/prisma.service");
const event_publisher_service_1 = require("../../events/event-publisher.service");
const cache_service_1 = require("../../common/cache/cache.service");
let PaymentGatewayModule = class PaymentGatewayModule {
};
exports.PaymentGatewayModule = PaymentGatewayModule;
exports.PaymentGatewayModule = PaymentGatewayModule = __decorate([
    (0, common_1.Module)({
        controllers: [payment_gateway_controller_1.PaymentGatewayController],
        providers: [
            payment_gateway_service_1.PaymentGatewayService,
            easypaisa_provider_1.EasypaisaProvider,
            jazzcash_provider_1.JazzCashProvider,
            bank_transfer_provider_1.BankTransferProvider,
            paypal_provider_1.PayPalProvider,
            prisma_service_1.PrismaService,
            event_publisher_service_1.EventPublisher,
            cache_service_1.CacheService,
        ],
        exports: [payment_gateway_service_1.PaymentGatewayService],
    })
], PaymentGatewayModule);
//# sourceMappingURL=payment-gateway.module.js.map