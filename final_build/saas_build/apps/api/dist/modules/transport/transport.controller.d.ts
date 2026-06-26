import { TransportService } from './transport.service';
export declare class TransportController {
    private readonly svc;
    constructor(svc: TransportService);
    stats(tid: string): Promise<{
        totalRoutes: any;
        activeRoutes: any;
        totalCapacity: any;
    }>;
    list(tid: string, sid: string, p: number, l: number): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    create(tid: string, sid: string, dto: any): Promise<any>;
    update(tid: string, id: string, dto: any): Promise<any>;
    remove(tid: string, id: string): Promise<{
        success: boolean;
    }>;
}
