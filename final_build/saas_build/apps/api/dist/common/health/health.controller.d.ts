import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../cache/cache.service';
export declare class HealthController {
    private prisma;
    private cache;
    constructor(prisma: PrismaService, cache: CacheService);
    liveness(): {
        status: string;
        uptime: number;
        ts: string;
    };
    readiness(): Promise<{
        status: string;
        checks: Record<string, any>;
        ts: string;
    }>;
    full(): {
        status: string;
        version: string;
        env: string | undefined;
        ts: string;
    };
}
