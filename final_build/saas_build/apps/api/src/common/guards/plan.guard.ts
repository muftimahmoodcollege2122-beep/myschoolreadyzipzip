import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../cache/cache.service';

interface PlanLimits {
  maxStudents: number;
  maxTeachers: number;
  smsEnabled: boolean;
  storageGb: number;
}

@Injectable()
export class PlanGuard {
  private readonly logger = new Logger(PlanGuard.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async assertStudentLimit(tenantId: string): Promise<void> {
    const limits = await this.getLimits(tenantId);
    if (limits.maxStudents === -1) return; // Enterprise: unlimited

    const count = await this.cache.get<number>(`count:students:${tenantId}`) ??
      await this.prisma.student.count({ where: { tenantId, isActive: true } });

    await this.cache.set(`count:students:${tenantId}`, count, 60);

    if (count >= limits.maxStudents) {
      throw new ForbiddenException(
        `Student limit reached (${count}/${limits.maxStudents}). Please upgrade your plan.`,
      );
    }
  }

  async assertTeacherLimit(tenantId: string): Promise<void> {
    const limits = await this.getLimits(tenantId);
    if (limits.maxTeachers === -1) return;

    const count = await this.prisma.teacher.count({ where: { tenantId, isActive: true } });
    if (count >= limits.maxTeachers) {
      throw new ForbiddenException(
        `Teacher limit reached (${count}/${limits.maxTeachers}). Please upgrade your plan.`,
      );
    }
  }

  async assertSmsEnabled(tenantId: string): Promise<void> {
    const limits = await this.getLimits(tenantId);
    if (!limits.smsEnabled) {
      throw new ForbiddenException('SMS notifications require Growth plan or higher.');
    }
  }

  async assertFeatureAccess(tenantId: string, feature: string): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { tier: true, status: true },
    });

    if (!tenant || tenant.status !== 'ACTIVE' && tenant.status !== 'TRIAL') {
      throw new ForbiddenException('Account is not active.');
    }

    const tierFeatures: Record<string, string[]> = {
      STARTER: ['attendance', 'grades', 'basic_fees', 'announcements'],
      GROWTH: ['attendance', 'grades', 'fees', 'sms', 'reports', 'library', 'transport'],
      PRO: ['attendance', 'grades', 'fees', 'sms', 'reports', 'library', 'transport', 'hostel', 'analytics', 'api_access'],
      ENTERPRISE: ['*'], // All features
    };

    const allowed = tierFeatures[tenant.tier] || [];
    if (!allowed.includes('*') && !allowed.includes(feature)) {
      throw new ForbiddenException(
        `Feature "${feature}" requires ${this.getRequiredTier(feature)} plan or higher.`,
      );
    }
  }

  private async getLimits(tenantId: string): Promise<PlanLimits> {
    const cached = await this.cache.get<PlanLimits>(`limits:${tenantId}`);
    if (cached) return cached;

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { planLimits: true },
    });

    const limits = (tenant?.planLimits as unknown as PlanLimits) || {
      maxStudents: 200,
      maxTeachers: 20,
      smsEnabled: false,
      storageGb: 1,
    };

    await this.cache.set(`limits:${tenantId}`, limits, 300);
    return limits;
  }

  private getRequiredTier(feature: string): string {
    const tierMap: Record<string, string> = {
      sms: 'Growth',
      analytics: 'Pro',
      api_access: 'Pro',
      hostel: 'Pro',
      custom_domain: 'Enterprise',
    };
    return tierMap[feature] || 'Growth';
  }
}
