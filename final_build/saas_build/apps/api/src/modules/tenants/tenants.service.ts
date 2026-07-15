/**
 * Tenants service — school onboarding and multi-tenancy management.
 * create(): provisions a new school tenant (slug, schema, Redis cache warm-up)
 * Queues async provisioning job (Bull) to seed default classes and subjects
 * updateCustomDomain(): links custom domain to tenant for white-label
 * suspend(): deactivates tenant on non-payment
 * getUsageStats(): returns student count, storage used vs plan limits
 */

import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
import { EventPublisher } from '../../events/event-publisher.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantStatus, TenantTier } from '../../common/prisma-enums';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly events: EventPublisher,
    private readonly audit: AuditService,
  ) {}

  async provision(dto: CreateTenantDto): Promise<any> {
    const slug = this.generateSlug(dto.schoolName);
    const existing = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existing) throw new ConflictException(`A school with this name already exists`);

    const tenantId = randomUUID();
    const schemaName = `tenant_${slug.replace(/-/g, '_')}`;

    const result = await this.prisma.$transaction(async tx => {
      const tenant = await tx.tenant.create({
        data: {
          id: tenantId, name: dto.schoolName, slug,
          tier: TenantTier.STARTER, status: TenantStatus.TRIAL, schemaName,
          dataRegion: dto.dataRegion || 'ap-south-1',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          planLimits: { maxStudents: 200, maxTeachers: 20, smsEnabled: false, storageGb: 1 },
          settings: {
            timezone: dto.timezone || 'Asia/Karachi',
            locale: dto.locale || 'en',
            currency: dto.currency || 'PKR',
            academicYear: dto.academicYear || this.getCurrentAcademicYear(),
          },
        },
      });

      const school = await tx.school.create({
        data: {
          tenantId, name: dto.schoolName,
          code: slug.slice(0, 10).toUpperCase(),
          address: dto.address || {},
          phone: dto.phone, email: dto.adminEmail,
          timezone: dto.timezone || 'Asia/Karachi',
          locale: dto.locale || 'en',
          academicYear: dto.academicYear || this.getCurrentAcademicYear(),
        },
      });

      const passwordHash = await bcrypt.hash(dto.adminPassword, 12);
      const adminUser = await tx.user.create({
        data: {
          tenantId, email: dto.adminEmail, passwordHash, role: 'SCHOOL_ADMIN', emailVerified: false,
          profile: { create: { firstName: dto.adminFirstName, lastName: dto.adminLastName, phone: dto.adminPhone } },
        },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId, topic: 'tenant.provisioned', key: tenantId,
          payload: { tenantId, slug, schoolName: dto.schoolName, adminEmail: dto.adminEmail, adminUserId: adminUser.id, schoolId: school.id },
          headers: { source: 'onboarding' },
        },
      });

      return { tenantId, slug, adminUserId: adminUser.id, schemaName, schoolId: school.id };
    });

    await this.audit.log({ tenantId, action: 'CREATE', entity: 'Tenant', entityId: tenantId, after: { slug, schoolName: dto.schoolName } });
    this.logger.log(`Tenant provisioned: ${slug} (${tenantId})`);
    return result;
  }

  async findById(tenantId: string): Promise<any> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { schools: {} },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async updateConfig(tenantId: string, config: any): Promise<void> {
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(config.logoUrl && { logoUrl: config.logoUrl }),
        ...(config.primaryColor && { primaryColor: config.primaryColor }),
        ...(config.customDomain && { customDomain: config.customDomain }),
      },
    });
    const t = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { slug: true } });
    if (t) await this.cache.del(`tenant:${t.slug}`);
  }

  async suspend(tenantId: string): Promise<void> {
    await this.prisma.tenant.update({ where: { id: tenantId }, data: { status: TenantStatus.SUSPENDED, suspendedAt: new Date() } });
    await this.cache.delPattern('tenant:*');
    this.logger.warn(`Tenant suspended: ${tenantId}`);
  }

  async reactivate(tenantId: string): Promise<void> {
    await this.prisma.tenant.update({ where: { id: tenantId }, data: { status: TenantStatus.ACTIVE, suspendedAt: null } });
    await this.cache.delPattern('tenant:*');
  }

  // ── Super-admin: platform-wide view across all tenants ────────────────────
  // NOTE: these are platform *list* prices, not live Stripe invoice amounts —
  // computing true MRR would require a Stripe API call per subscription.
  private readonly PLAN_LIST_PRICE_PKR: Record<string, number> = { STARTER: 4999, GROWTH: 12999, PRO: 29999, ENTERPRISE: 0 };

  async listAll() {
    const tenants = await this.prisma.tenant.findMany({
      include: { schools: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const tenantIds = tenants.map(t => t.id);
    const [studentCounts, latestSubs] = await Promise.all([
      this.prisma.student.groupBy({ by: ['tenantId'], where: { tenantId: { in: tenantIds }, isActive: true }, _count: true }),
      this.prisma.subscription.findMany({ where: { tenantId: { in: tenantIds } }, orderBy: { createdAt: 'desc' } }),
    ]);
    const studentMap = Object.fromEntries(studentCounts.map(s => [s.tenantId, s._count]));
    const subMap = new Map<string, any>();
    for (const s of latestSubs) if (!subMap.has(s.tenantId)) subMap.set(s.tenantId, s);

    return tenants.map(t => {
      const sub = subMap.get(t.id);
      const mrr = t.status === 'ACTIVE' ? (this.PLAN_LIST_PRICE_PKR[t.tier] || 0) : 0;
      return {
        id: t.id, name: t.name, slug: t.slug, status: t.status, tier: t.tier,
        students: studentMap[t.id] || 0, mrr, createdAt: t.createdAt,
        subscriptionStatus: sub?.status || null,
      };
    });
  }

  async getPlatformSummary() {
    const list = await this.listAll();
    const totalRevenue = list.reduce((sum, t) => sum + t.mrr, 0);
    const totalStudents = list.reduce((sum, t) => sum + t.students, 0);
    const byStatus = list.reduce((acc: Record<string, number>, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});
    const byTier = list.reduce((acc: Record<string, number>, t) => { acc[t.tier] = (acc[t.tier] || 0) + 1; return acc; }, {});
    const activeStaff = await this.prisma.user.count({ where: { tenantId: { in: list.map(t => t.id) }, role: { in: ['TEACHER', 'STAFF'] }, isActive: true } });
    return { totalSchools: list.length, totalRevenue, totalStudents, activeStaff, byStatus, byTier };
  }

  private generateSlug(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50)
      .replace(/^-|-$/g, '');
  }

  private getCurrentAcademicYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    return now.getMonth() + 1 >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  }
}
