import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SupportTicketsService {
  private readonly logger = new Logger(SupportTicketsService.name);
  constructor(private readonly prisma: PrismaService) {}

  private generateTicketNo() { return `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,5).toUpperCase()}`; }

  async createTicket(dto: any, tenantId: string, submittedById: string) {
    const slaHours = { LOW: 72, MEDIUM: 24, HIGH: 8, URGENT: 2 }[dto.priority ?? 'MEDIUM'] ?? 24;
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);
    return this.prisma.supportTicket.create({
      data: { tenantId, ticketNo: this.generateTicketNo(), subject: dto.subject, description: dto.description, priority: dto.priority ?? 'MEDIUM', category: dto.category ?? 'OTHER', submittedById, slaDeadline },
    });
  }

  async listTickets(tenantId: string, status?: string, priority?: string, category?: string, submittedById?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId, ...(status && { status }), ...(priority && { priority }), ...(category && { category }), ...(submittedById && { submittedById }) };
    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({ where, include: { responses: { orderBy: { createdAt: 'desc' }, take: 1 } }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      this.prisma.supportTicket.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getTicket(id: string, tenantId: string) {
    const t = await this.prisma.supportTicket.findFirst({ where: { id, tenantId }, include: { responses: { orderBy: { createdAt: 'asc' } } } });
    if (!t) throw new NotFoundException('Ticket not found');
    return t;
  }

  async respondToTicket(ticketId: string, dto: any, tenantId: string, authorId: string) {
    const ticket = await this.prisma.supportTicket.findFirst({ where: { id: ticketId, tenantId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return this.prisma.$transaction!(async tx => {
      const response = await tx.ticketResponse.create({ data: { ticketId, tenantId, authorId, content: dto.content, isInternal: dto.isInternal ?? false, attachments: dto.attachments ?? [] } });
      if (ticket.status === 'OPEN') await tx.supportTicket.update({ where: { id: ticketId }, data: { status: 'IN_PROGRESS', assignedToId: authorId } });
      return response;
    });
  }

  async updateTicketStatus(id: string, status: string, tenantId: string, userId: string) {
    const t = await this.prisma.supportTicket.findFirst({ where: { id, tenantId } });
    if (!t) throw new NotFoundException('Ticket not found');
    const update: any = { status, updatedAt: new Date() };
    if (status === 'RESOLVED') update.resolvedAt = new Date();
    if (status === 'CLOSED') update.closedAt = new Date();
    return this.prisma.supportTicket.update({ where: { id }, data: update });
  }

  async assignTicket(id: string, assignedToId: string, tenantId: string) {
    return this.prisma.supportTicket.update({ where: { id }, data: { assignedToId, status: 'IN_PROGRESS' } });
  }

  async rateTicket(id: string, satisfaction: number, tenantId: string) {
    return this.prisma.supportTicket.update({ where: { id }, data: { satisfaction } });
  }

  async getTicketStats(tenantId: string) {
    const [total, open, inProgress, resolved, slaBreached] = await Promise.all([
      this.prisma.supportTicket.count({ where: { tenantId } }),
      this.prisma.supportTicket.count({ where: { tenantId, status: 'OPEN' } }),
      this.prisma.supportTicket.count({ where: { tenantId, status: 'IN_PROGRESS' } }),
      this.prisma.supportTicket.count({ where: { tenantId, status: 'RESOLVED' } }),
      this.prisma.supportTicket.count({ where: { tenantId, status: { in: ['OPEN', 'IN_PROGRESS'] }, slaDeadline: { lt: new Date() } } }),
    ]);
    return { total, open, inProgress, resolved, slaBreached, resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0 };
  }
}
