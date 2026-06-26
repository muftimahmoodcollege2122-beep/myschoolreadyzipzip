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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const cache_service_1 = require("../cache/cache.service");
const tenant_id_decorator_1 = require("../decorators/tenant-id.decorator");
let HealthController = class HealthController {
    constructor(prisma, cache) {
        this.prisma = prisma;
        this.cache = cache;
    }
    liveness() { return { status: 'ok', uptime: process.uptime(), ts: new Date().toISOString() }; }
    async readiness() {
        const checks = {};
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            checks.db = 'ok';
        }
        catch {
            checks.db = 'fail';
        }
        try {
            await this.cache.set('__health', '1', 5);
            checks.redis = 'ok';
        }
        catch {
            checks.redis = 'fail';
        }
        const ok = Object.values(checks).every(v => v === 'ok');
        return { status: ok ? 'ok' : 'degraded', checks, ts: new Date().toISOString() };
    }
    full() { return { status: 'ok', version: process.env.npm_package_version ?? '1.0.0', env: process.env.NODE_ENV, ts: new Date().toISOString() }; }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)('live'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "liveness", null);
__decorate([
    (0, common_1.Get)('ready'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "readiness", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "full", null);
exports.HealthController = HealthController = __decorate([
    (0, tenant_id_decorator_1.Public)(),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, cache_service_1.CacheService])
], HealthController);
//# sourceMappingURL=health.controller.js.map