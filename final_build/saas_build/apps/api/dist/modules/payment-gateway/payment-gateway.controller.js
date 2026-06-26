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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payment_gateway_service_1 = require("./payment-gateway.service");
const initiate_payment_dto_1 = require("./dto/initiate-payment.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let PaymentGatewayController = class PaymentGatewayController {
    constructor(svc) {
        this.svc = svc;
    }
    getPlanPrices() {
        return this.svc.getPlanPrices();
    }
    initiatePayment(dto) {
        return this.svc.initiatePayment(dto);
    }
    verifyPayment(dto) {
        return this.svc.verifyPayment(dto);
    }
    capturePayPal(paypalOrderId, internalOrderId) {
        return this.svc.capturePayPal(paypalOrderId, internalOrderId);
    }
    jazzCashWebhook(payload) {
        return this.svc.handleJazzCashWebhook(payload);
    }
    getPendingVerifications() {
        return this.svc.getPendingVerifications();
    }
    approvePayment(id) {
        return this.svc.approveManualPayment(id);
    }
};
exports.PaymentGatewayController = PaymentGatewayController;
__decorate([
    (0, common_1.Get)('plans'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all plan prices in PKR and USD' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentGatewayController.prototype, "getPlanPrices", null);
__decorate([
    (0, common_1.Post)('initiate'),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate a payment via EasyPaisa, JazzCash, Bank, IBAN, or PayPal' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [initiate_payment_dto_1.InitiatePaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentGatewayController.prototype, "initiatePayment", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit payment proof for manual verification' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [initiate_payment_dto_1.VerifyPaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentGatewayController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Post)('paypal/capture'),
    (0, swagger_1.ApiOperation)({ summary: 'Capture a PayPal order after user approval' }),
    __param(0, (0, common_1.Query)('token')),
    __param(1, (0, common_1.Query)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PaymentGatewayController.prototype, "capturePayPal", null);
__decorate([
    (0, common_1.Post)('jazzcash/webhook'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'JazzCash payment webhook' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentGatewayController.prototype, "jazzCashWebhook", null);
__decorate([
    (0, common_1.Get)('admin/pending'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all pending manual payment verifications (Super Admin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentGatewayController.prototype, "getPendingVerifications", null);
__decorate([
    (0, common_1.Post)('admin/approve/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a manual payment and activate tenant (Super Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentGatewayController.prototype, "approvePayment", null);
exports.PaymentGatewayController = PaymentGatewayController = __decorate([
    (0, swagger_1.ApiTags)('Payment Gateway'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payment_gateway_service_1.PaymentGatewayService])
], PaymentGatewayController);
//# sourceMappingURL=payment-gateway.controller.js.map