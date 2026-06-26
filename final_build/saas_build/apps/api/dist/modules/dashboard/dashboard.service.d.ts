import { PrismaService } from '../../database/prisma.service';
import { ReplicaService } from '../../database/replica.service';
import { CacheService } from '../../common/cache/cache.service';
export declare class DashboardService {
    private readonly prisma;
    private readonly replica;
    private readonly cache;
    private readonly logger;
    constructor(prisma: PrismaService, replica: ReplicaService, cache: CacheService);
    private resolveSchoolId;
    getSchoolDashboard(tenantId: string, schoolId: string): Promise<any>;
    getPlatformStats(): Promise<any>;
}
