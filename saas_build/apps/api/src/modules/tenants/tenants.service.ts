import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
import { EventPublisher } from '../../events/event-publisher.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantStatus, TenantTier } from '@prisma/client';
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
      include: { schools: { where: { isActive: true } } },
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

  async isSlugAvailable(slug: string): Promise<boolean> {
    const existing = await this.prisma.tenant.findUnique({ where: { slug } });
    return !existing;
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
