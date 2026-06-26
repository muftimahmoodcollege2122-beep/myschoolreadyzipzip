import { PrismaService } from '../../database/prisma.service';
export declare class TransportService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private resolveSchoolId;
    listRoutes(tenantId: string, schoolId: string, page?: number, limit?: number): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    createRoute(tenantId: string, schoolId: string, dto: any): Promise<any>;
    updateRoute(tenantId: string, id: string, dto: any): Promise<any>;
    deleteRoute(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getStats(tenantId: string): Promise<{
        totalRoutes: any;
        activeRoutes: any;
        totalCapacity: any;
    }>;
}
