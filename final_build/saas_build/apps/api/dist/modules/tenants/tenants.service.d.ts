import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
import { EventPublisher } from '../../events/event-publisher.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
export declare class TenantsService {
    private readonly prisma;
    private readonly cache;
    private readonly events;
    private readonly audit;
    private readonly logger;
    constructor(prisma: PrismaService, cache: CacheService, events: EventPublisher, audit: AuditService);
    provision(dto: CreateTenantDto): Promise<any>;
    findById(tenantId: string): Promise<any>;
    updateConfig(tenantId: string, config: any): Promise<void>;
    suspend(tenantId: string): Promise<void>;
    reactivate(tenantId: string): Promise<void>;
    private generateSlug;
    private getCurrentAcademicYear;
}
