import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TimetableService } from './timetable.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@ApiTags('Timetable') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('timetable')
export class TimetableController {
  constructor(private readonly svc: TimetableService) {}
  @Post() @Roles('SCHOOL_ADMIN') createSlot(@Body() dto: any, @TenantId() tid: string) { return this.svc.createSlot(dto, tid); }
  @Get('section/:id') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT') sectionTimetable(@Param('id', ParseUUIDPipe) id: string, @Query('academicYear') y: string, @TenantId() tid: string) { return this.svc.getSectionTimetable(id, tid, y); }
  @Get('teacher/:id') @Roles('SCHOOL_ADMIN','TEACHER') teacherTimetable(@Param('id', ParseUUIDPipe) id: string, @Query('academicYear') y: string, @TenantId() tid: string) { return this.svc.getTeacherTimetable(id, tid, y); }
  @Delete(':id') @Roles('SCHOOL_ADMIN') deleteSlot(@Param('id', ParseUUIDPipe) id: string, @TenantId() tid: string) { return this.svc.deleteSlot(id, tid); }
}
