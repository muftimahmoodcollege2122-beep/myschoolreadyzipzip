/**
 * Students REST controller — manages enrolled students.
 * POST /students — enroll new student (SCHOOL_ADMIN only, rate limited 30/min)
 * GET /students — paginated list with search and filters
 * GET /students/me — current logged-in student's own record
 * GET /students/:id — single student details
 * PATCH /students/:id — update student info
 * DELETE /students/:id — deactivate student
 * DELETE /students/:id/personal-data — GDPR erasure
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentListQueryDto } from './dto/student-list-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Throttle } from '../../common/guards/throttle.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles('SCHOOL_ADMIN')
  @Throttle(30, 60) // 30 creates per minute per tenant
  @ApiOperation({ summary: 'Enroll a new student' })
  @ApiResponse({ status: 201, description: 'Student enrolled successfully' })
  @ApiResponse({ status: 409, description: 'Admission number already exists' })
  @ApiResponse({ status: 403, description: 'Student limit reached — upgrade plan' })
  async create(
    @Body() dto: CreateStudentDto,
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    const schoolId = req.tenantContext?.planLimits?.['defaultSchoolId'] as string ||
      (req.body as any).schoolId;

    return this.studentsService.create(dto, tenantId, schoolId, user.sub);
  }

  // ── Bulk import / export ────────────────────────────────────────────────

  @Get('bulk-import/template')
  @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Download the .xlsx template for bulk student import' })
  async downloadImportTemplate(@Res() res: Response) {
    const buffer = this.studentsService.getImportTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=students-import-template.xlsx',
    });
    res.send(buffer);
  }

  @Post('bulk-import')
  @Roles('SCHOOL_ADMIN')
  @Throttle(5, 300) // 5 imports per 5 minutes — these are heavy, not for rapid-fire use
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } })) // 10MB max
  @ApiOperation({ summary: 'Bulk import students from an uploaded .xlsx/.csv file' })
  async bulkImport(
    @UploadedFile() file: Express.Multer.File,
    @TenantId() tenantId: string,
    @Query('schoolId') schoolId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) throw new Error('No file uploaded. Please attach a .xlsx or .csv file.');
    return this.studentsService.bulkImport(file.buffer, tenantId, schoolId, user.sub);
  }

  @Get('export/excel')
  @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Export all active students to .xlsx' })
  async exportExcel(@TenantId() tenantId: string, @Query('schoolId') schoolId: string, @Res() res: Response) {
    const buffer = await this.studentsService.exportToExcel(tenantId, schoolId);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=students-${new Date().toISOString().slice(0, 10)}.xlsx`,
    });
    res.send(buffer);
  }

  @Get('me')
  @Roles('STUDENT', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT')
  @ApiOperation({ summary: 'Get current user\'s student record' })
  async findMe(@TenantId() tenantId: string, @CurrentUser() user: JwtPayload) {
    return this.studentsService.findByUserId(user.sub, tenantId);
  }

  @Get()
  @Roles('SCHOOL_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'List students with filters and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'classId', required: false, type: String })
  @ApiQuery({ name: 'sectionId', required: false, type: String })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: StudentListQueryDto,
    @Req() req: Request,
  ) {
    const schoolId = (req.query as any).schoolId as string;
    return this.studentsService.findAll(tenantId, schoolId, query);
  }

  @Get(':id')
  @Roles('SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT')
  @ApiOperation({ summary: 'Get student by ID' })
  @ApiParam({ name: 'id', description: 'Student UUID' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
  ) {
    return this.studentsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Update student information' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentDto,
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.studentsService.update(id, dto, tenantId, user.sub);
  }

  @Delete(':id')
  @Roles('SCHOOL_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate student' })
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.studentsService.deactivate(id, tenantId, user.sub);
  }

  @Delete(':id/personal-data')
  @Roles('SCHOOL_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'GDPR: Erase student personal data (irreversible)' })
  async erasePersonalData(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.studentsService.erasePersonalData(id, tenantId, user.sub);
  }
}
