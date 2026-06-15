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
  Req,
} from '@nestjs/common';
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
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../database/prisma.service';
import type { JwtPayload } from '../auth/auth.service';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles('SCHOOL_ADMIN')
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
    // Resolve schoolId: try body → planLimits → auto-lookup first active school
    let schoolId: string = (req.body as any).schoolId
      || req.tenantContext?.planLimits?.['defaultSchoolId'] as string;

    if (!schoolId) {
      const school = await this.prisma.school.findFirst({
        where: { tenantId, isActive: true },
        select: { id: true },
      });
      schoolId = school?.id ?? '';
    }

    // Default academicYear if not provided
    if (!dto.academicYear) {
      const now = new Date();
      const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      (dto as any).academicYear = `${year}-${year + 1}`;
    }

    return this.studentsService.create(dto, tenantId, schoolId, user.sub);
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
