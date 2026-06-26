import { PrismaService } from '../../database/prisma.service';
import { AuditAction } from '@prisma/client';
export interface AuditLogEntry {
    tenantId: string;
    userId?: string;
    action: AuditAction;
    entity: string;
    entityId: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    correlationId?: string;
}
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    log(entry: AuditLogEntry): Promise<void>;
    private sanitize;
}
