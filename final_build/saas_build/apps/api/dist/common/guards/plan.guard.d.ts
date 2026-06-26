import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../cache/cache.service';
export declare class PlanGuard {
    private readonly prisma;
    private readonly cache;
    private readonly logger;
    constructor(prisma: PrismaService, cache: CacheService);
    assertStudentLimit(tenantId: string): Promise<void>;
    assertTeacherLimit(tenantId: string): Promise<void>;
    assertSmsEnabled(tenantId: string): Promise<void>;
    assertFeatureAccess(tenantId: string, feature: string): Promise<void>;
    private getLimits;
    private getRequiredTier;
}
