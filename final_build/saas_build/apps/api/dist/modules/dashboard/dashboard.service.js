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
var DashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const replica_service_1 = require("../../database/replica.service");
const cache_service_1 = require("../../common/cache/cache.service");
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function withTimeout(promise, ms, fallback) {
    return Promise.race([
        promise,
        new Promise(res => setTimeout(() => res(fallback), ms)),
    ]);
}
let DashboardService = DashboardService_1 = class DashboardService {
    constructor(prisma, replica, cache) {
        this.prisma = prisma;
        this.replica = replica;
        this.cache = cache;
        this.logger = new common_1.Logger(DashboardService_1.name);
    }
    async resolveSchoolId(tenantId, schoolId) {
        if (schoolId && UUID_RE.test(schoolId))
            return schoolId;
        const school = await this.prisma.school.findFirst({ where: { tenantId }, select: { id: true } });
        return school?.id;
    }
    async getSchoolDashboard(tenantId, schoolId) {
        const resolvedSchoolId = await this.resolveSchoolId(tenantId, schoolId);
        const cacheKey = `dashboard:${tenantId}:${resolvedSchoolId ?? 'none'}`;
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const schoolFilter = resolvedSchoolId
            ? { tenantId, schoolId: resolvedSchoolId, isActive: true }
            : { tenantId, isActive: true };
        const feeFilter = resolvedSchoolId
            ? { tenantId, status: { in: ['PENDING', 'OVERDUE'] }, student: { schoolId: resolvedSchoolId } }
            : { tenantId, status: { in: ['PENDING', 'OVERDUE'] } };
        const db = this.replica;
        const [totalStudents, totalTeachers, upcomingExams, pendingFeeAgg, recentNotifications, todayAttendance] = await Promise.all([
            withTimeout(db.student.count({ where: schoolFilter }), 3000, 0),
            withTimeout(db.teacher.count({ where: schoolFilter }), 3000, 0),
            withTimeout(db.exam.findMany({
                where: { tenantId, scheduledAt: { gte: today } },
                take: 3, orderBy: { scheduledAt: 'asc' },
                include: { subject: true },
            }), 3000, []),
            withTimeout(db.feeInvoice.aggregate({
                where: feeFilter,
                _sum: { amount: true }, _count: { id: true },
            }), 3000, { _sum: { amount: 0 }, _count: { id: 0 } }),
            withTimeout(db.notification.count({
                where: { tenantId, createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
            }), 3000, 0),
            withTimeout(db.attendance.groupBy({
                by: ['status'],
                where: { tenantId, date: today },
                _count: { status: true },
            }), 3000, []),
        ]);
        const present = todayAttendance.find(r => r.status === 'PRESENT')?._count.status ?? 0;
        const absent = todayAttendance.find(r => r.status === 'ABSENT')?._count.status ?? 0;
        const late = todayAttendance.find(r => r.status === 'LATE')?._count.status ?? 0;
        const total = present + absent + late;
        const result = {
            totalStudents,
            totalTeachers,
            schoolId: resolvedSchoolId,
            attendance: { present, absent, late, total, rate: total > 0 ? Math.round((present / total) * 100) : 0 },
            fees: { outstanding: Number(pendingFeeAgg._sum?.amount ?? 0), invoiceCount: pendingFeeAgg._count?.id ?? 0 },
            notifications: recentNotifications,
            upcomingExams,
            cachedAt: new Date().toISOString(),
        };
        await this.cache.set(cacheKey, result, 300);
        return result;
    }
    async getPlatformStats() {
        return this.cache.remember('platform:stats', 120, async () => {
            const db = this.replica;
            const [totalTenants, activeTenants, totalStudents, totalTeachers, planBreakdown] = await Promise.all([
                withTimeout(db.tenant.count(), 5000, 0),
                withTimeout(db.tenant.count({ where: { status: 'ACTIVE' } }), 5000, 0),
                withTimeout(db.student.count(), 5000, 0),
                withTimeout(db.teacher.count(), 5000, 0),
                withTimeout(db.tenant.groupBy({ by: ['tier'], _count: { tier: true } }), 5000, []),
            ]);
            return { totalTenants, activeTenants, totalStudents, totalTeachers, planBreakdown };
        });
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = DashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        replica_service_1.ReplicaService,
        cache_service_1.CacheService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map