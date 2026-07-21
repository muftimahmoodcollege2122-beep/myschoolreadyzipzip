import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Grades') @ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grades')
export class GradesController {
  constructor(private readonly svc: GradesService) {}

  @Post() @Roles('TEACHER', 'SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Create a grade entry' })
  create(@Body() dto: CreateGradeDto, @TenantId() tid: string, @CurrentUser() u: any) {
    return this.svc.createGrade(dto, tid, u.sub);
  }

  @Get('student/:studentId') @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Get student grades for a year/term' })
  studentGrades(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('academicYear') academicYear: string,
    @Query('term') term: string,
    @TenantId() tid: string,
  ) {
    return this.svc.getStudentGrades(studentId, tid, academicYear, term);
  }

  @Get('student/:studentId/report-card') @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Get full report card for a student' })
  reportCard(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('academicYear') academicYear: string,
    @Query('term') term: string,
    @TenantId() tid: string,
  ) {
    return this.svc.getStudentReportCard(studentId, tid, academicYear, term);
  }

  @Get('section/:sectionId/gradebook') @Roles('SCHOOL_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get gradebook for entire section' })
  gradebook(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Query('classSubjectId') classSubjectId: string,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
    @TenantId() tid: string,
  ) {
    return this.svc.getSectionGradebook(sectionId, classSubjectId, tid, term, academicYear);
  }
}
