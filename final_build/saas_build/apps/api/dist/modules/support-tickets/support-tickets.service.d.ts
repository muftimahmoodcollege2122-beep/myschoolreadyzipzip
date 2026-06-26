import { PrismaService } from '../../database/prisma.service';
export declare class SupportTicketsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private generateTicketNo;
    createTicket(dto: any, tenantId: string, submittedById: string): Promise<any>;
    listTickets(tenantId: string, status?: string, priority?: string, category?: string, submittedById?: string, page?: number, limit?: number): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getTicket(id: string, tenantId: string): Promise<any>;
    respondToTicket(ticketId: string, dto: any, tenantId: string, authorId: string): Promise<any>;
    updateTicketStatus(id: string, status: string, tenantId: string, userId: string): Promise<any>;
    assignTicket(id: string, assignedToId: string, tenantId: string): Promise<any>;
    rateTicket(id: string, satisfaction: number, tenantId: string): Promise<any>;
    getTicketStats(tenantId: string): Promise<{
        total: any;
        open: any;
        inProgress: any;
        resolved: any;
        slaBreached: any;
        resolutionRate: number;
    }>;
}
