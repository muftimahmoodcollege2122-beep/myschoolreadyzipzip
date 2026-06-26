import { SupportTicketsService } from './support-tickets.service';
export declare class SupportTicketsController {
    private readonly svc;
    constructor(svc: SupportTicketsService);
    createTicket(dto: any, tid: string, u: any): Promise<any>;
    listTickets(tid: string, s?: string, p?: string, c?: string, page?: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getStats(tid: string): Promise<{
        total: any;
        open: any;
        inProgress: any;
        resolved: any;
        slaBreached: any;
        resolutionRate: number;
    }>;
    getTicket(id: string, tid: string): Promise<any>;
    respondToTicket(id: string, dto: any, tid: string, u: any): Promise<any>;
    updateStatus(id: string, dto: any, tid: string, u: any): Promise<any>;
    assignTicket(id: string, dto: any, tid: string): Promise<any>;
    rateTicket(id: string, dto: any, tid: string): Promise<any>;
}
