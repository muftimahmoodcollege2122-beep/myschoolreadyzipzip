import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { HrExtendedService } from './hr-extended.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('HR Extended') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('hr')
export class HrExtendedController {
  constructor(private readonly svc: HrExtendedService) {}
  @Post('lesson-plans') @Roles('TEACHER') createLessonPlan(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.createLessonPlan(dto, tid, u.sub); }
  @Get('lesson-plans') @Roles('SCHOOL_ADMIN','TEACHER') listLessonPlans(@TenantId() tid: string, @Query('teacherId') tid2?: string, @Query('week') week?: string, @Query('status') status?: string) { return this.svc.listLessonPlans(tid, tid2, week, status); }
  @Put('lesson-plans/:id') @Roles('TEACHER') updateLessonPlan(@Param('id') id: string, @Body() dto: any, @TenantId() tid: string) { return this.svc.updateLessonPlan(id, dto, tid); }
  @Put('lesson-plans/:id/submit') @Roles('TEACHER') submitLessonPlan(@Param('id') id: string, @TenantId() tid: string) { return this.svc.submitLessonPlan(id, tid); }
  @Put('lesson-plans/:id/approve') @Roles('SCHOOL_ADMIN') approveLessonPlan(@Param('id') id: string, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.approveLessonPlan(id, tid, u.sub); }
  @Put('lesson-plans/:id/reject') @Roles('SCHOOL_ADMIN') rejectLessonPlan(@Param('id') id: string, @Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.rejectLessonPlan(id, dto.note, tid, u.sub); }
  @Post('substitutions') @Roles('SCHOOL_ADMIN') createSubstitution(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.createSubstitution(dto, tid, u.sub); }
  @Get('substitutions') @Roles('SCHOOL_ADMIN','TEACHER') listSubstitutions(@TenantId() tid: string, @Query('date') date?: string, @Query('teacherId') tid2?: string) { return this.svc.listSubstitutions(tid, date, tid2); }
  @Put('substitutions/:id/status') @Roles('SCHOOL_ADMIN','TEACHER') updateSubstitutionStatus(@Param('id') id: string, @Body() dto: any, @TenantId() tid: string) { return this.svc.updateSubstitutionStatus(id, dto.status, tid); }
  @Post('training') @Roles('SCHOOL_ADMIN') addTraining(@Body() dto: any, @TenantId() tid: string) { return this.svc.addTraining(dto, tid); }
  @Get('training') @Roles('SCHOOL_ADMIN','TEACHER') listTrainings(@TenantId() tid: string, @Query('teacherId') tid2?: string, @Query('status') status?: string) { return this.svc.listTrainings(tid, tid2, status); }
  @Put('training/:id/complete') @Roles('SCHOOL_ADMIN') completeTraining(@Param('id') id: string, @TenantId() tid: string, @Body() dto: any) { return this.svc.completeTraining(id, tid, dto.certificateUrl); }
  @Post('certifications') @Roles('SCHOOL_ADMIN','TEACHER') addCertification(@Body() dto: any, @TenantId() tid: string) { return this.svc.addCertification(dto, tid); }
  @Get('certifications') @Roles('SCHOOL_ADMIN','TEACHER') listCertifications(@TenantId() tid: string, @Query('teacherId') tid2?: string) { return this.svc.listCertifications(tid, tid2); }
  @Put('certifications/:id/verify') @Roles('SCHOOL_ADMIN') verifyCertification(@Param('id') id: string, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.verifyCertification(id, tid, u.sub); }
  @Get('payroll') @Roles('SCHOOL_ADMIN') getPayrollSummary(@TenantId() tid: string, @Query('schoolId') sid: string, @Query('month') month: string) { return this.svc.getPayrollSummary(tid, sid, month); }
  @Get('workload/:teacherId') @Roles('SCHOOL_ADMIN','TEACHER') getTeacherWorkload(@Param('teacherId') tid2: string, @TenantId() tid: string) { return this.svc.getTeacherWorkload(tid2, tid); }
}
