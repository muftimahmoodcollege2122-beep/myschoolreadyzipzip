import { PrismaService } from '../../database/prisma.service';
export declare class AlumniService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(dto: any, tenantId: string): Promise<any>;
    findAll(tenantId: string, schoolId?: string, year?: number, search?: string, page?: number, limit?: number): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, tenantId: string): Promise<any>;
    update(id: string, dto: any, tenantId: string): Promise<any>;
    verify(id: string, tenantId: string, verifiedById: string): Promise<any>;
    delete(id: string, tenantId: string): Promise<any>;
    getStats(tenantId: string, schoolId?: string): Promise<{
        total: any;
        verified: any;
        byYear: any;
        byOccupation: any;
    }>;
}
