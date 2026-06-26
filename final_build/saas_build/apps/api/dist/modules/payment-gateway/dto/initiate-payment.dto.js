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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyPaymentDto = exports.InitiatePaymentDto = exports.PaymentPlan = exports.PaymentMethod = void 0;
const class_validator_1 = require("class-validator");
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["EASYPAISA"] = "EASYPAISA";
    PaymentMethod["JAZZCASH"] = "JAZZCASH";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["IBAN"] = "IBAN";
    PaymentMethod["PAYPAL"] = "PAYPAL";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentPlan;
(function (PaymentPlan) {
    PaymentPlan["STARTER"] = "STARTER";
    PaymentPlan["PROFESSIONAL"] = "PROFESSIONAL";
    PaymentPlan["ENTERPRISE"] = "ENTERPRISE";
})(PaymentPlan || (exports.PaymentPlan = PaymentPlan = {}));
class InitiatePaymentDto {
}
exports.InitiatePaymentDto = InitiatePaymentDto;
__decorate([
    (0, class_validator_1.IsEnum)(PaymentMethod),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PaymentPlan),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "plan", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "schoolName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "senderAccount", void 0);
class VerifyPaymentDto {
}
exports.VerifyPaymentDto = VerifyPaymentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "paymentId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "transactionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "screenshot", void 0);
//# sourceMappingURL=initiate-payment.dto.js.map