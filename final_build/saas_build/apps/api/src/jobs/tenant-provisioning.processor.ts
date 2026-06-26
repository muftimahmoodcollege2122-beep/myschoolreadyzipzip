import { Processor, Process, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../database/prisma.service';
import { CacheService } from '../common/cache/cache.service';

export interface ProvisionTenantJob {
  tenantId: string;
  slug: string;
  schoolName: string;
  adminUserId: string;
}

@Processor('tenant-provisioning')
export class TenantProvisioningProcessor {
  private readonly logger = new Logger(TenantProvisioningProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  @Process('provision')
  async handleProvision(job: Job<ProvisionTenantJob>): Promise<void> {
    const { tenantId, slug, schoolName, adminUserId } = job.data;
    this.logger.log(`Provisioning tenant ${slug} (${tenantId})`);

    await job.progress(10);

    // 1. Create default academic year
    const now = new Date();
    const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const academicYear = `${year}-${year + 1}`;

    // 2. Seed default grade structure
    const school = await this.prisma.school.findFirst({ where: { tenantId } });
    if (!school) throw new Error(`School not found for tenant ${tenantId}`);

    await job.progress(30);

    // 3. Seed default classes (Grade 1-12)
    const classes: any[] = [];
    for (let i = 1; i <= 12; i++) {
      classes.push({
        tenantId,
        schoolId: school.id,
        name: `Grade ${i}`,
        level: i,
        academicYear,
      });
    }
    await this.prisma.class.createMany({ data: classes, skipDuplicates: true });

    await job.progress(60);

    // 4. Seed default subjects
    const subjects = [
      { name: 'Mathematics',  code: 'MATH', isElective: false },
      { name: 'English',      code: 'ENG',  isElective: false },
      { name: 'Urdu',         code: 'URD',  isElective: false },
      { name: 'Science',      code: 'SCI',  isElective: false },
      { name: 'Islamiat',     code: 'ISL',  isElective: false },
      { name: 'Social Studies', code: 'SST', isElective: false },
      { name: 'Computer Science', code: 'CS', isElective: true },
      { name: 'Physics',      code: 'PHY',  isElective: true },
      { name: 'Chemistry',    code: 'CHEM', isElective: true },
      { name: 'Biology',      code: 'BIO',  isElective: true },
    ];
    await this.prisma.subject.createMany({
      data: subjects.map(s => ({ tenantId, schoolId: school.id, creditHours: 1, ...s })),
      skipDuplicates: true,
    });

    await job.progress(80);

    // 5. Warm the tenant cache so first request is instant
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (tenant) await this.cache.set(`tenant:${slug}`, tenant, 300);

    await job.progress(100);
    this.logger.log(`Tenant ${slug} provisioned successfully`);
  }

  @OnQueueFailed()
  onFailed(job: Job<ProvisionTenantJob>, err: Error): void {
    this.logger.error(`Tenant provisioning failed for ${job.data.slug}: ${err.message}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job<ProvisionTenantJob>): void {
    this.logger.log(`Tenant provisioning completed: ${job.data.slug}`);
  }
}
