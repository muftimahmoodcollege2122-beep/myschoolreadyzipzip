import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SupportTicketsService } from './support-tickets.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Support Tickets') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('support-tickets')
export class SupportTicketsController {
  constructor(private readonly svc: SupportTicketsService) {}
  @Post() createTicket(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.createTicket(dto, tid, u.sub); }
  @Get() listTickets(@TenantId() tid: string, @Query('status') s?: string, @Query('priority') p?: string, @Query('category') c?: string, @Query('page') page?: string) { return this.svc.listTickets(tid, s, p, c, undefined, page ? +page : 1); }
  @Get('stats') @Roles('SCHOOL_ADMIN','SUPER_ADMIN') getStats(@TenantId() tid: string) { return this.svc.getTicketStats(tid); }
  @Get(':id') getTicket(@Param('id') id: string, @TenantId() tid: string) { return this.svc.getTicket(id, tid); }
  @Post(':id/respond') respondToTicket(@Param('id') id: string, @Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.respondToTicket(id, dto, tid, u.sub); }
  @Put(':id/status') @Roles('SCHOOL_ADMIN','SUPER_ADMIN') updateStatus(@Param('id') id: string, @Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.updateTicketStatus(id, dto.status, tid, u.sub); }
  @Put(':id/assign') @Roles('SCHOOL_ADMIN','SUPER_ADMIN') assignTicket(@Param('id') id: string, @Body() dto: any, @TenantId() tid: string) { return this.svc.assignTicket(id, dto.assignedToId, tid); }
  @Put(':id/rate') rateTicket(@Param('id') id: string, @Body() dto: any, @TenantId() tid: string) { return this.svc.rateTicket(id, dto.satisfaction, tid); }
}
