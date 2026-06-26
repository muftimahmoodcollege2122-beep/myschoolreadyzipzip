import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../cache/cache.service';
export interface TenantContext {
    tenantId: string;
    tenantSlug: string;
    tier: string;
    status: string;
    schemaName: string;
    planLimits: Record<string, unknown>;
    dataRegion: string;
}
declare global {
    namespace Express {
        interface Request {
            tenantContext?: TenantContext;
        }
    }
}
export declare class TenantContextMiddleware implements NestMiddleware {
    private readonly prisma;
    private readonly cache;
    private readonly logger;
    private readonly l1Cache;
    private readonly L1_TTL_MS;
    constructor(prisma: PrismaService, cache: CacheService);
    use(req: Request, _res: Response, next: NextFunction): Promise<void>;
    private resolveBySlug;
    private resolveByDomain;
    private extractFromHost;
    private extractFromPath;
    private evictL1;
}
