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
var PlanGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const cache_service_1 = require("../cache/cache.service");
let PlanGuard = PlanGuard_1 = class PlanGuard {
    constructor(prisma, cache) {
        this.prisma = prisma;
        this.cache = cache;
        this.logger = new common_1.Logger(PlanGuard_1.name);
    }
    async assertStudentLimit(tenantId) {
        const limits = await this.getLimits(tenantId);
        if (limits.maxStudents === -1)
            return;
        const count = await this.cache.get(`count:students:${tenantId}`) ??
            await this.prisma.student.count({ where: { tenantId, isActive: true } });
        await this.cache.set(`count:students:${tenantId}`, count, 60);
        if (count >= limits.maxStudents) {
            throw new common_1.ForbiddenException(`Student limit reached (${count}/${limits.maxStudents}). Please upgrade your plan.`);
        }
    }
    async assertTeacherLimit(tenantId) {
        const limits = await this.getLimits(tenantId);
        if (limits.maxTeachers === -1)
            return;
        const count = await this.prisma.teacher.count({ where: { tenantId, isActive: true } });
        if (count >= limits.maxTeachers) {
            throw new common_1.ForbiddenException(`Teacher limit reached (${count}/${limits.maxTeachers}). Please upgrade your plan.`);
        }
    }
    async assertSmsEnabled(tenantId) {
        const limits = await this.getLimits(tenantId);
        if (!limits.smsEnabled) {
            throw new common_1.ForbiddenException('SMS notifications require Growth plan or higher.');
        }
    }
    async assertFeatureAccess(tenantId, feature) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { tier: true, status: true },
        });
        if (!tenant || tenant.status !== 'ACTIVE' && tenant.status !== 'TRIAL') {
            throw new common_1.ForbiddenException('Account is not active.');
        }
        const tierFeatures = {
            STARTER: ['attendance', 'grades', 'basic_fees', 'announcements'],
            GROWTH: ['attendance', 'grades', 'fees', 'sms', 'reports', 'library', 'transport'],
            PRO: ['attendance', 'grades', 'fees', 'sms', 'reports', 'library', 'transport', 'hostel', 'analytics', 'api_access'],
            ENTERPRISE: ['*'],
        };
        const allowed = tierFeatures[tenant.tier] || [];
        if (!allowed.includes('*') && !allowed.includes(feature)) {
            throw new common_1.ForbiddenException(`Feature "${feature}" requires ${this.getRequiredTier(feature)} plan or higher.`);
        }
    }
    async getLimits(tenantId) {
        const cached = await this.cache.get(`limits:${tenantId}`);
        if (cached)
            return cached;
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { planLimits: true },
        });
        const limits = tenant?.planLimits || {
            maxStudents: 200,
            maxTeachers: 20,
            smsEnabled: false,
            storageGb: 1,
        };
        await this.cache.set(`limits:${tenantId}`, limits, 300);
        return limits;
    }
    getRequiredTier(feature) {
        const tierMap = {
            sms: 'Growth',
            analytics: 'Pro',
            api_access: 'Pro',
            hostel: 'Pro',
            custom_domain: 'Enterprise',
        };
        return tierMap[feature] || 'Growth';
    }
};
exports.PlanGuard = PlanGuard;
exports.PlanGuard = PlanGuard = PlanGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cache_service_1.CacheService])
], PlanGuard);
//# sourceMappingURL=plan.guard.js.map