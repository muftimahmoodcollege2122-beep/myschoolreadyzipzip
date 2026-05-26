import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  constructor(private readonly prisma: PrismaService, private readonly cache: CacheService) {}

  async getSchoolDashboard(tenantId: string, schoolId: string): Promise<any> {
    const cacheKey = `dashboard:${tenantId}:${schoolId}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalStudents, totalTeachers, upcomingExams, pendingFeeAgg, recentNotifications] = await Promise.all([
      this.prisma.student.count({ where: { tenantId, schoolId, isActive: true } }),
      this.prisma.teacher.count({ where: { tenantId, schoolId, isActive: true } }),
      this.prisma.exam.findMany({
        where: { tenantId, startDate: { gte: today } },
        take: 3, orderBy: { startDate: 'asc' },
        include: { section: { include: { class: true } } },
      }),
      this.prisma.feeInvoice.aggregate({
        where: { tenantId, status: { in: ['PENDING', 'OVERDUE'] as any }, student: { schoolId } },
        _sum: { amount: true }, _count: { id: true },
      }),
      this.prisma.notification.count({
        where: { tenantId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    // Get today's attendance totals
    const todayAttendance = await this.prisma.attendance.groupBy({
      by: ['status'],
      where: { tenantId, date: today },
      _count: { status: true },
    }).catch(() => []);

    const present = todayAttendance.find(r => r.status === 'PRESENT')?._count.status ?? 0;
    const absent  = todayAttendance.find(r => r.status === 'ABSENT')?._count.status ?? 0;
    const total   = present + absent;

    const result = {
      totalStudents,
      totalTeachers,
      attendance: { present, absent, total, rate: total > 0 ? Math.round((present / total) * 100) : 0 },
      fees: { outstanding: Number(pendingFeeAgg._sum.amount ?? 0), invoiceCount: pendingFeeAgg._count.id },
      notifications: recentNotifications,
      upcomingExams,
    };

    await this.cache.set(cacheKey, result, 300);
    return result;
  }

  async getPlatformStats(): Promise<any> {
    const cacheKey = 'platform:stats';
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const [totalTenants, activeTenants, totalStudents, totalTeachers, planBreakdown] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      this.prisma.student.count(),
      this.prisma.teacher.count(),
      this.prisma.tenant.groupBy({ by: ['tier'], _count: { tier: true } }),
    ]);

    const result = { totalTenants, activeTenants, totalStudents, totalTeachers, planBreakdown };
    await this.cache.set(cacheKey, result, 60);
    return result;
  }
}
