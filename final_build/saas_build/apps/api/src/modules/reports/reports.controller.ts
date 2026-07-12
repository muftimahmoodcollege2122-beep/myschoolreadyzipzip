import { Controller, Get, Post, Body, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Response } from 'express';

@ApiTags('Reports') @ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  // ── Teacher Performance Analytics ─────────────────────────────────────────
  @Get('teacher-performance') @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Real per-teacher performance: pass rate, avg marks, attendance, lesson completion' })
  async teacherPerformance(@TenantId() tid: string) {
    return this.svc.getTeacherPerformance(tid);
  }

  // ── Report Card ────────────────────────────────────────────────────────────
  @Post('report-card')
  @Roles('SCHOOL_ADMIN','TEACHER')
  @ApiOperation({ summary: 'Queue report card PDF generation for a single student' })
  async queueReportCard(
    @Body() dto: { studentId: string; academicYear: string; term: string },
    @TenantId() tid: string,
    @CurrentUser() u: any,
  ) {
    const jobId = await this.svc.queueReport({
      type: 'report_card',
      tenantId: tid,
      parameters: { studentId: dto.studentId, academicYear: dto.academicYear, term: dto.term },
      requestedById: u.sub,
    });
    return { success: true, jobId, message: 'Report card queued. Student will be notified when ready.' };
  }

  @Post('report-cards/bulk')
  @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Queue report card generation for ALL students' })
  async bulkReportCards(
    @Body() dto: { academicYear: string; term: string; schoolId?: string },
    @TenantId() tid: string,
    @CurrentUser() u: any,
  ) {
    const jobId = await this.svc.queueReport({
      type: 'report_card',
      tenantId: tid,
      parameters: { bulk: true, academicYear: dto.academicYear, term: dto.term, schoolId: dto.schoolId },
      requestedById: u.sub,
    });
    return { success: true, jobId, message: 'Bulk report card generation started. All students will be notified.' };
  }

  @Get('report-card/pdf') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT')
  @ApiOperation({ summary: 'Generate and stream report card PDF immediately (sync)' })
  async reportCardPdf(
    @Query('studentId') studentId: string,
    @Query('academicYear') academicYear: string,
    @Query('term') term: string,
    @TenantId() tid: string,
  ) {
    const key = await this.svc.generateReportCardPdf(studentId, tid, academicYear, term);
    return { success: true, s3Key: key };
  }

  // ── Exports ────────────────────────────────────────────────────────────────
  @Get('students/export') @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Export students to Excel' })
  async exportStudents(
    @Query('schoolId') schoolId: string,
    @TenantId() tid: string,
    @Res() res: Response,
  ) {
    const buffer = await this.svc.exportStudentsToExcel(tid, schoolId, {});
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=students-${new Date().toISOString().slice(0,10)}.xlsx`,
    });
    res.send(buffer);
  }

  @Get('attendance/export') @Roles('SCHOOL_ADMIN','TEACHER')
  @ApiOperation({ summary: 'Export attendance CSV' })
  async attendanceCsv(
    @Query('sectionId') sectionId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @TenantId() tid: string,
    @Res() res: Response,
  ) {
    const csv = await this.svc.exportAttendanceCsv(
      tid, sectionId,
      from ? new Date(from) : new Date(Date.now() - 30*24*60*60*1000),
      to ? new Date(to) : new Date(),
    );
    res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=attendance.csv' });
    res.send(csv);
  }
}
