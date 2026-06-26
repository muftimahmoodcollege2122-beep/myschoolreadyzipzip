import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ReplicaService } from '../../database/replica.service';
import { CacheService } from '../../common/cache/cache.service';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Run a promise with a timeout — prevents slow DB queries from blocking responses */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>(res => setTimeout(() => res(fallback), ms)),
  ]);
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly replica: ReplicaService,  // heavy reads go to replica
    private readonly cache: CacheService,
  ) {}

  private async resolveSchoolId(tenantId: string, schoolId?: string): Promise<string | undefined> {
    if (schoolId && UUID_RE.test(schoolId)) return schoolId;
    const school = await this.prisma.school.findFirst({ where: { tenantId }, select: { id: true } });
    return school?.id;
  }

  async getSchoolDashboard(tenantId: string, schoolId: string): Promise<any> {
    const resolvedSchoolId = await this.resolveSchoolId(tenantId, schoolId);
    const cacheKey = `dashboard:${tenantId}:${resolvedSchoolId ?? 'none'}`;

    // Batch fetch all sub-keys in one Redis round trip
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schoolFilter = resolvedSchoolId
      ? { tenantId, schoolId: resolvedSchoolId, isActive: true }
      : { tenantId, isActive: true };
    const feeFilter = resolvedSchoolId
      ? { tenantId, status: { in: ['PENDING', 'OVERDUE'] as any }, student: { schoolId: resolvedSchoolId } }
      : { tenantId, status: { in: ['PENDING', 'OVERDUE'] as any } };

    // All queries go to replica — primary is only for writes
    const db = this.replica;

    const [totalStudents, totalTeachers, upcomingExams, pendingFeeAgg, recentNotifications, todayAttendance] =
      await Promise.all([
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

    const present = (todayAttendance as any[]).find(r => r.status === 'PRESENT')?._count.status ?? 0;
    const absent  = (todayAttendance as any[]).find(r => r.status === 'ABSENT')?._count.status ?? 0;
    const late    = (todayAttendance as any[]).find(r => r.status === 'LATE')?._count.status ?? 0;
    const total   = present + absent + late;

    const result = {
      totalStudents,
      totalTeachers,
      schoolId: resolvedSchoolId,
      attendance: { present, absent, late, total, rate: total > 0 ? Math.round((present / total) * 100) : 0 },
      fees: { outstanding: Number((pendingFeeAgg as any)._sum?.amount ?? 0), invoiceCount: (pendingFeeAgg as any)._count?.id ?? 0 },
      notifications: recentNotifications,
      upcomingExams,
      cachedAt: new Date().toISOString(),
    };

    await this.cache.set(cacheKey, result, 300); // 5-min TTL
    return result;
  }

  async getPlatformStats(): Promise<any> {
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
}
