import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentListQueryDto } from './dto/student-list-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';

@ApiTags('Students') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post() @Roles('SCHOOL_ADMIN')
  async create(@Body() dto: CreateStudentDto, @TenantId() tenantId: string, @CurrentUser() user: JwtPayload, @Req() req: Request) {
    const schoolId = (req.body as any).schoolId;
    return this.studentsService.create(dto, tenantId, schoolId, user.sub);
  }

  @Get('me') @Roles('STUDENT','SCHOOL_ADMIN','TEACHER','PARENT')
  async findMe(@TenantId() tenantId: string, @CurrentUser() user: JwtPayload) {
    return this.studentsService.findByUserId(user.sub, tenantId);
  }

  @Get() @Roles('SCHOOL_ADMIN','TEACHER')
  async findAll(@TenantId() tenantId: string, @Query() query: StudentListQueryDto, @Req() req: Request) {
    return this.studentsService.findAll(query, tenantId, (req.query as any).schoolId);
  }

  @Get(':id') @Roles('SCHOOL_ADMIN','TEACHER','PARENT','STUDENT')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @TenantId() tenantId: string) {
    return this.studentsService.findOne(id, tenantId);
  }

  @Patch(':id') @Roles('SCHOOL_ADMIN')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStudentDto, @TenantId() tenantId: string, @CurrentUser() user: JwtPayload) {
    return this.studentsService.update(id, dto, tenantId, user.sub);
  }

  @Delete(':id') @Roles('SCHOOL_ADMIN') @HttpCode(HttpStatus.NO_CONTENT)
  async deactivate(@Param('id', ParseUUIDPipe) id: string, @TenantId() tenantId: string, @CurrentUser() user: JwtPayload) {
    return this.studentsService.deactivate(id, tenantId, user.sub);
  }

  // ── Admissions ──────────────────────────────────────────────────────────────
  @Post('admissions/apply') @Roles('SCHOOL_ADMIN') // also called from public school website (no JWT required via separate route)
  @ApiOperation({ summary: 'Submit online admission application' })
  submitApplication(@Body() dto: any, @TenantId() tid: string) {
    return this.studentsService.submitAdmissionApplication(dto, tid);
  }

  @Get('admissions/applications') @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Get all admission applications' })
  getApplications(@TenantId() tid: string, @Query('status') status?: string) {
    return this.studentsService.getAdmissionApplications(tid, status);
  }

  @Patch('admissions/applications/:appId/status') @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Approve / Reject / Waitlist an application' })
  updateStatus(@Param('appId') appId: string, @Body() dto: { status: 'APPROVED'|'REJECTED'|'WAITLISTED'; remarks?: string }, @TenantId() tid: string) {
    return this.studentsService.updateAdmissionStatus(tid, appId, dto.status, dto.remarks);
  }

  @Post('admissions/applications/:appId/enroll') @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Convert approved application to enrolled student' })
  enrollApplicant(@Param('appId') appId: string, @Body() dto: { sectionId: string; rollNumber: string; admissionNo: string }, @TenantId() tid: string, @CurrentUser() u: JwtPayload) {
    return this.studentsService.enrollApprovedApplicant(tid, appId, dto, u.sub);
  }
}
