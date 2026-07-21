import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CommunicationService } from './communication.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Communication') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('communication')
export class CommunicationController {
  constructor(private readonly svc: CommunicationService) {}
  @Post('messages') @Roles('SCHOOL_ADMIN','TEACHER','PARENT','STUDENT')
  send(@Body() dto: any, @CurrentUser() u: any, @TenantId() tid: string) { return this.svc.sendMessage(dto, u.sub, tid); }
  @Get('threads') @Roles('SCHOOL_ADMIN','TEACHER','PARENT','STUDENT')
  threads(@CurrentUser() u: any, @TenantId() tid: string) { return this.svc.getThreads(u.sub, tid); }
  @Get('threads/:id') @Roles('SCHOOL_ADMIN','TEACHER','PARENT','STUDENT')
  thread(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: any, @TenantId() tid: string) { return this.svc.getThread(id, u.sub, tid); }
  @Get('announcements') @Roles('SCHOOL_ADMIN','TEACHER','PARENT','STUDENT')
  announcements(@Query('schoolId') sid: string, @TenantId() tid: string) { return this.svc.getAnnouncements(tid, sid); }
  @Post('announcements') @Roles('SCHOOL_ADMIN')
  createAnnouncement(@Body() dto: any, @CurrentUser() u: any, @TenantId() tid: string) { return this.svc.createAnnouncement(dto, u.sub, tid); }
}
