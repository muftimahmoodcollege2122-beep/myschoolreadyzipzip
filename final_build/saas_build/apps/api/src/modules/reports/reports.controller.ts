import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
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

  @Get('report-card/pdf') @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Generate student report card PDF' })
  async reportCardPdf(
    @Query('studentId') studentId: string,
    @Query('academicYear') academicYear: string,
    @Query('term') term: string,
    @TenantId() tid: string,
  ) {
    const key = await this.svc.generateReportCardPdf(studentId, tid, academicYear, term);
    return { success: true, s3Key: key };
  }

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
      'Content-Disposition': 'attachment; filename=students.xlsx',
    });
    res.send(buffer);
  }

  @Get('attendance/export') @Roles('SCHOOL_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Export attendance CSV' })
  async attendanceCsv(
    @Query('sectionId') sectionId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @TenantId() tid: string,
    @Res() res: Response,
  ) {
    const csv = await this.svc.exportAttendanceCsv(tid, sectionId, new Date(from), new Date(to));
    res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=attendance.csv' });
    res.send(csv);
  }
}
