import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StudentRecordsService } from './student-records.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Student Records') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('student-records')
export class StudentRecordsController {
  constructor(private readonly svc: StudentRecordsService) {}
  @Post('behavior') @Roles('SCHOOL_ADMIN','TEACHER') logBehavior(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.logBehavior(dto, tid, u.sub); }
  @Get('behavior/:studentId') @Roles('SCHOOL_ADMIN','TEACHER','PARENT') getBehavior(@Param('studentId') sid: string, @TenantId() tid: string, @Query('type') type?: string) { return this.svc.getBehaviorHistory(sid, tid, type); }
  @Put('behavior/:id/resolve') @Roles('SCHOOL_ADMIN','TEACHER') resolveBehavior(@Param('id') id: string, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.resolveBehavior(id, tid, u.sub); }
  @Get('behavior/stats/overview') @Roles('SCHOOL_ADMIN') getBehaviorStats(@TenantId() tid: string, @Query('schoolId') sid?: string) { return this.svc.getBehaviorStats(tid, sid); }
  @Put('medical/:studentId') @Roles('SCHOOL_ADMIN','TEACHER') upsertMedical(@Param('studentId') sid: string, @Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.upsertMedical(sid, dto, tid, u.sub); }
  @Get('medical/:studentId') @Roles('SCHOOL_ADMIN','TEACHER') getMedical(@Param('studentId') sid: string, @TenantId() tid: string) { return this.svc.getMedical(sid, tid); }
  @Post('achievements') @Roles('SCHOOL_ADMIN','TEACHER') addAchievement(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.addAchievement(dto, tid, u.sub); }
  @Get('achievements/:studentId') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT') getAchievements(@Param('studentId') sid: string, @TenantId() tid: string) { return this.svc.getAchievements(sid, tid); }
  @Delete('achievements/:id') @Roles('SCHOOL_ADMIN') deleteAchievement(@Param('id') id: string, @TenantId() tid: string) { return this.svc.deleteAchievement(id, tid); }
  @Post('warnings') @Roles('SCHOOL_ADMIN','TEACHER') issueWarning(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.issueWarning(dto, tid, u.sub); }
  @Get('warnings/:studentId') @Roles('SCHOOL_ADMIN','TEACHER','PARENT') getWarnings(@Param('studentId') sid: string, @TenantId() tid: string, @Query('active') active?: string) { return this.svc.getWarnings(sid, tid, active !== 'false'); }
  @Put('warnings/:id/resolve') @Roles('SCHOOL_ADMIN') resolveWarning(@Param('id') id: string, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.resolveWarning(id, tid, u.sub); }
  @Get('summary/:studentId') @Roles('SCHOOL_ADMIN','TEACHER','PARENT') getDisciplinarySummary(@Param('studentId') sid: string, @TenantId() tid: string) { return this.svc.getDisciplinarySummary(sid, tid); }
}
