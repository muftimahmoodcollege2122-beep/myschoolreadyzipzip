import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Attendance') @ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly svc: AttendanceService) {}

  @Post('section/:sectionId') @Roles('TEACHER', 'SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Mark attendance for a class section' })
  markSection(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Body() records: MarkAttendanceDto[],
    @TenantId() tid: string,
    @CurrentUser() u: any,
  ) {
    return this.svc.markSectionAttendance(sectionId, tid, u.sub, records);
  }

  @Get('section/:sectionId') @Roles('SCHOOL_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get attendance already marked for a section on a given date' })
  sectionForDate(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Query('date') date: string,
    @TenantId() tid: string,
  ) {
    return this.svc.getSectionAttendanceForDate(sectionId, tid, date);
  }

  @Get('section/:sectionId/report') @Roles('SCHOOL_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get section attendance report' })
  sectionReport(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @TenantId() tid: string,
  ) {
    return this.svc.getSectionAttendanceReport(sectionId, tid, { startDate, endDate });
  }

  @Get('student/:studentId') @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Get student attendance between dates' })
  studentAttendance(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @TenantId() tid: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end   = endDate ? new Date(endDate) : new Date();
    return this.svc.getStudentAttendance(studentId, tid, start, end);
  }

  @Get('today/summary') @Roles('SCHOOL_ADMIN', 'TEACHER')
  @ApiOperation({ summary: "Today's attendance summary" })
  todaySummary(@TenantId() tid: string, @Query('schoolId') schoolId?: string) {
    return this.svc.getTodayAttendanceSummary(tid, schoolId);
  }

  @Get('chronic-absentees') @Roles('SCHOOL_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Students below attendance threshold' })
  chronicAbsentees(
    @Query('schoolId') schoolId: string,
    @Query('threshold') threshold: number,
    @Query('academicYear') academicYear: string,
    @TenantId() tid: string,
  ) {
    return this.svc.getChronicAbsentees(schoolId, tid, threshold ?? 75, academicYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1));
  }
}
