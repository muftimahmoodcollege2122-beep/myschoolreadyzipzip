import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
export declare class TenantsController {
    private readonly svc;
    constructor(svc: TenantsService);
    create(dto: CreateTenantDto): Promise<any>;
    current(tid: string): Promise<any>;
    updateBranding(tid: string, dto: any): Promise<void>;
    suspend(id: string): Promise<void>;
    reactivate(id: string): Promise<void>;
}
