import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Notifications') @ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get('my') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT')
  @ApiOperation({ summary: 'Get my notifications' })
  getMyNotifications(@CurrentUser() u: any, @TenantId() tid: string, @Query('limit') limit = '20') {
    return this.svc.getUserNotifications(u.sub, tid, Number(limit));
  }

  @Get('unread-count') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  getUnreadCount(@CurrentUser() u: any, @TenantId() tid: string) {
    return this.svc.getUnreadCount(u.sub, tid);
  }

  @Post(':id/read') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT')
  markRead(@Param('id') id: string, @CurrentUser() u: any, @TenantId() tid: string) {
    return this.svc.markAsRead(id, u.sub, tid);
  }

  @Post('read-all') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT')
  markAllRead(@CurrentUser() u: any, @TenantId() tid: string) {
    return this.svc.markAllAsRead(u.sub, tid);
  }

  @Post('broadcast') @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Broadcast to audience — ALL_PARENTS, ALL_STUDENTS, ALL_TEACHERS, ALL_STAFF, ENTIRE_SCHOOL' })
  async broadcast(
    @Body() dto: { schoolId?: string; title: string; body: string; channels: string[]; audience: string },
    @TenantId() tid: string,
  ) {
    return this.svc.broadcastToAudience(tid, dto.schoolId || '', dto.title, dto.body, dto.channels, dto.audience);
  }

  @Post('send-inapp') @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Send in-app notification to a specific user' })
  sendInApp(
    @Body() dto: { userId: string; title: string; body: string; data?: any },
    @TenantId() tid: string,
  ) {
    return this.svc.sendInApp(dto.userId, tid, dto.title, dto.body, dto.data);
  }
}
