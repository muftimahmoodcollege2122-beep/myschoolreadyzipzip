import { Job } from 'bull';
import { PrismaService } from '../database/prisma.service';
import { CacheService } from '../common/cache/cache.service';
export interface ProvisionTenantJob {
    tenantId: string;
    slug: string;
    schoolName: string;
    adminUserId: string;
}
export declare class TenantProvisioningProcessor {
    private readonly prisma;
    private readonly cache;
    private readonly logger;
    constructor(prisma: PrismaService, cache: CacheService);
    handleProvision(job: Job<ProvisionTenantJob>): Promise<void>;
    onFailed(job: Job<ProvisionTenantJob>, err: Error): void;
    onCompleted(job: Job<ProvisionTenantJob>): void;
}
