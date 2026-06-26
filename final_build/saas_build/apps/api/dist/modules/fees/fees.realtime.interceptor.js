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
exports.FeesRealtimeInterceptor = void 0;
const common_1 = require("@nestjs/common");
const realtime_service_1 = require("../../realtime/realtime.service");
let FeesRealtimeInterceptor = class FeesRealtimeInterceptor {
    constructor(realtime) {
        this.realtime = realtime;
    }
    async afterPaymentRecorded(tenantId, payload) {
        await this.realtime.onFeePaymentRecorded(tenantId, payload);
    }
};
exports.FeesRealtimeInterceptor = FeesRealtimeInterceptor;
exports.FeesRealtimeInterceptor = FeesRealtimeInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [realtime_service_1.RealtimeService])
], FeesRealtimeInterceptor);
//# sourceMappingURL=fees.realtime.interceptor.js.map