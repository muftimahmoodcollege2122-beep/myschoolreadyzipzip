import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RealtimeService } from './realtime.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { TenantId } from '../common/decorators/tenant-id.decorator';

@ApiTags('Realtime') @ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('realtime')
export class RealtimeController {
  constructor(private readonly svc: RealtimeService) {}

  @Get('online-count') @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Get count of online users in this school' })
  onlineCount(@TenantId() tid: string) {
    return { count: this.svc.getOnlineCount(tid), tenantId: tid };
  }

  @Post('announce') @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Broadcast real-time announcement to school' })
  announce(
    @Body() dto: { title: string; body: string; priority?: 'normal' | 'urgent'; targetRoles?: string[] },
    @TenantId() tid: string,
  ) {
    this.svc.broadcastAnnouncement(tid, { id: Date.now().toString(), ...dto, priority: dto.priority ?? 'normal' });
    return { success: true, message: 'Announcement broadcast' };
  }

  @Post('dashboard/update') @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Push live dashboard stats update' })
  dashboardUpdate(@Body() stats: any, @TenantId() tid: string) {
    this.svc.broadcastDashboardUpdate(tid, stats);
    return { success: true };
  }
}
