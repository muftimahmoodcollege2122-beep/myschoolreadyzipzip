import { AlumniService } from './alumni.service';
export declare class AlumniController {
    private readonly svc;
    constructor(svc: AlumniService);
    create(dto: any, tid: string): Promise<any>;
    findAll(tid: string, sid?: string, year?: string, search?: string, page?: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getStats(tid: string, sid?: string): Promise<{
        total: any;
        verified: any;
        byYear: any;
        byOccupation: any;
    }>;
    findOne(id: string, tid: string): Promise<any>;
    update(id: string, dto: any, tid: string): Promise<any>;
    verify(id: string, tid: string, u: any): Promise<any>;
    delete(id: string, tid: string): Promise<any>;
}
