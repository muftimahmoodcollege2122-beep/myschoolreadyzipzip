import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Notifications') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}
  @Get() @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT')
  getAll(@CurrentUser() u: any, @TenantId() tid: string, @Query('page') page = 1, @Query('limit') limit = 20) { return this.svc.getForUser(u.sub, tid, page, limit); }
  @Post(':id/read') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT')
  markRead(@Param('id', ParseUUIDPipe) id: string, @TenantId() tid: string) { return this.svc.markRead(id, tid); }
  @Post('broadcast') @Roles('SCHOOL_ADMIN')
  broadcast(@Body() dto: { schoolId: string; title: string; body: string; channels: string[] }, @TenantId() tid: string) { return this.svc.broadcastAnnouncement(dto.schoolId, dto.title, dto.body, dto.channels, tid); }
}
