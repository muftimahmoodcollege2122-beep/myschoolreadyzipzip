import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@ApiTags('Search & Analytics') @ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard) @Controller('search')
export class SearchController {
  constructor(private readonly svc: SearchService) {}

  @Get() @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT')
  global(@Query('q') q: string, @TenantId() tid: string) { return this.svc.globalSearch(q, tid); }

  @Get('students') @Roles('SCHOOL_ADMIN','TEACHER')
  students(@Query('q') q: string, @Query('classId') classId: string, @Query('sectionId') sectionId: string, @TenantId() tid: string) {
    return this.svc.studentSearch(q, tid, { classId, sectionId });
  }

  @Get('analytics/attendance') @Roles('SCHOOL_ADMIN','TEACHER')
  attendance(@Query('schoolId') sid: string, @Query('from') from: string, @Query('to') to: string, @TenantId() tid: string) {
    return this.svc.getAttendanceAnalytics(tid, sid, from, to);
  }

  @Get('analytics/fees') @Roles('SCHOOL_ADMIN','ACCOUNTANT')
  fees(@Query('schoolId') sid: string, @Query('year') year: number, @TenantId() tid: string) {
    return this.svc.getFeeAnalytics(tid, sid, year ?? new Date().getFullYear());
  }

  @Get('analytics/enrollment') @Roles('SCHOOL_ADMIN')
  enrollment(@Query('schoolId') sid: string, @TenantId() tid: string) { return this.svc.getEnrollmentTrend(tid, sid); }

  @Get('analytics/exams') @Roles('SCHOOL_ADMIN','TEACHER')
  exams(@Query('sectionId') sid: string, @Query('academicYear') y: string, @TenantId() tid: string) {
    return this.svc.getExamPerformanceAnalytics(tid, sid, y);
  }

  @Get('analytics/platform') @Roles('SUPER_ADMIN')
  platform() { return this.svc.getPlatformAnalytics(); }
}
