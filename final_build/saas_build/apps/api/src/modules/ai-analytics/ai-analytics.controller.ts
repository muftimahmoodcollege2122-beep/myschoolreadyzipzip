import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiAnalyticsService } from './ai-analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@ApiTags('AI Analytics') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('ai-analytics')
export class AiAnalyticsController {
  constructor(private readonly svc: AiAnalyticsService) {}
  @Get('dropout-risk') @Roles('SCHOOL_ADMIN') getDropoutRisk(@TenantId() tid: string, @Query('schoolId') sid?: string) { return this.svc.getDropoutRiskStudents(tid, sid); }
  @Get('performance/:studentId') @Roles('SCHOOL_ADMIN','TEACHER','PARENT','STUDENT') getPerformancePrediction(@Query('studentId') sid: string, @TenantId() tid: string) { return this.svc.getPerformancePrediction(tid, sid); }
  @Get('attendance') @Roles('SCHOOL_ADMIN','TEACHER') getAttendanceAnalytics(@TenantId() tid: string, @Query('schoolId') sid?: string) { return this.svc.getAttendanceAnalytics(tid, sid); }
  @Get('fees') @Roles('SCHOOL_ADMIN') getFeeAnalytics(@TenantId() tid: string) { return this.svc.getFeeAnalytics(tid); }
  @Get('school-performance') @Roles('SCHOOL_ADMIN') getSchoolPerformance(@TenantId() tid: string) { return this.svc.getSchoolPerformanceDashboard(tid); }
  @Get('benchmarking') @Roles('SCHOOL_ADMIN') getBenchmarking(@TenantId() tid: string) { return this.svc.getBenchmarkingData(tid); }
  @Post('generate-report') @Roles('SCHOOL_ADMIN') generateReport(@Body() dto: any, @TenantId() tid: string) { return this.svc.generateAiReport(dto.type, tid, dto.params ?? {}); }
}
