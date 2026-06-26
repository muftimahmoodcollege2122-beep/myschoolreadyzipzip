"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SupportTicketsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportTicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let SupportTicketsService = SupportTicketsService_1 = class SupportTicketsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SupportTicketsService_1.name);
    }
    generateTicketNo() { return `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`; }
    async createTicket(dto, tenantId, submittedById) {
        const slaHours = { LOW: 72, MEDIUM: 24, HIGH: 8, URGENT: 2 }[dto.priority ?? 'MEDIUM'] ?? 24;
        const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);
        return this.prisma.supportTicket.create({
            data: { tenantId, ticketNo: this.generateTicketNo(), subject: dto.subject, description: dto.description, priority: dto.priority ?? 'MEDIUM', category: dto.category ?? 'OTHER', submittedById, slaDeadline },
        });
    }
    async listTickets(tenantId, status, priority, category, submittedById, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = { tenantId, ...(status && { status }), ...(priority && { priority }), ...(category && { category }), ...(submittedById && { submittedById }) };
        const [data, total] = await Promise.all([
            this.prisma.supportTicket.findMany({ where, include: { responses: { orderBy: { createdAt: 'desc' }, take: 1 } }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
            this.prisma.supportTicket.count({ where }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getTicket(id, tenantId) {
        const t = await this.prisma.supportTicket.findFirst({ where: { id, tenantId }, include: { responses: { orderBy: { createdAt: 'asc' } } } });
        if (!t)
            throw new common_1.NotFoundException('Ticket not found');
        return t;
    }
    async respondToTicket(ticketId, dto, tenantId, authorId) {
        const ticket = await this.prisma.supportTicket.findFirst({ where: { id: ticketId, tenantId } });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        return this.prisma.$transaction(async (tx) => {
            const response = await tx.ticketResponse.create({ data: { ticketId, tenantId, authorId, content: dto.content, isInternal: dto.isInternal ?? false, attachments: dto.attachments ?? [] } });
            if (ticket.status === 'OPEN')
                await tx.supportTicket.update({ where: { id: ticketId }, data: { status: 'IN_PROGRESS', assignedToId: authorId } });
            return response;
        });
    }
    async updateTicketStatus(id, status, tenantId, userId) {
        const t = await this.prisma.supportTicket.findFirst({ where: { id, tenantId } });
        if (!t)
            throw new common_1.NotFoundException('Ticket not found');
        const update = { status, updatedAt: new Date() };
        if (status === 'RESOLVED')
            update.resolvedAt = new Date();
        if (status === 'CLOSED')
            update.closedAt = new Date();
        return this.prisma.supportTicket.update({ where: { id }, data: update });
    }
    async assignTicket(id, assignedToId, tenantId) {
        return this.prisma.supportTicket.update({ where: { id }, data: { assignedToId, status: 'IN_PROGRESS' } });
    }
    async rateTicket(id, satisfaction, tenantId) {
        return this.prisma.supportTicket.update({ where: { id }, data: { satisfaction } });
    }
    async getTicketStats(tenantId) {
        const [total, open, inProgress, resolved, slaBreached] = await Promise.all([
            this.prisma.supportTicket.count({ where: { tenantId } }),
            this.prisma.supportTicket.count({ where: { tenantId, status: 'OPEN' } }),
            this.prisma.supportTicket.count({ where: { tenantId, status: 'IN_PROGRESS' } }),
            this.prisma.supportTicket.count({ where: { tenantId, status: 'RESOLVED' } }),
            this.prisma.supportTicket.count({ where: { tenantId, status: { in: ['OPEN', 'IN_PROGRESS'] }, slaDeadline: { lt: new Date() } } }),
        ]);
        return { total, open, inProgress, resolved, slaBreached, resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0 };
    }
};
exports.SupportTicketsService = SupportTicketsService;
exports.SupportTicketsService = SupportTicketsService = SupportTicketsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupportTicketsService);
//# sourceMappingURL=support-tickets.service.js.map