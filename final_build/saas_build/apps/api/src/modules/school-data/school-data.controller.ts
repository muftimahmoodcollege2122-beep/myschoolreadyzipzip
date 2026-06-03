import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SchoolDataService } from './school-data.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('School Data') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('school')
export class SchoolDataController {
  constructor(private readonly svc: SchoolDataService) {}

  @Get('info') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT')
  schoolInfo(@TenantId() tid: string) { return this.svc.getSchoolInfo(tid); }

  @Put('info') @Roles('SCHOOL_ADMIN')
  updateSchool(@TenantId() tid: string, @Body() dto: any) { return this.svc.updateSchoolInfo(tid, dto); }

  // Classes
  @Get('classes') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT')
  classes(@TenantId() tid: string, @Query('schoolId') sid: string) { return this.svc.listClasses(tid, sid); }

  @Post('classes') @Roles('SCHOOL_ADMIN')
  createClass(@TenantId() tid: string, @Query('schoolId') sid: string, @Body() dto: any) { return this.svc.createClass(tid, sid, dto); }

  @Put('classes/:id') @Roles('SCHOOL_ADMIN')
  updateClass(@TenantId() tid: string, @Param('id') id: string, @Body() dto: any) { return this.svc.updateClass(tid, id, dto); }

  // Sections
  @Get('sections') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT')
  sections(@TenantId() tid: string, @Query('schoolId') sid: string, @Query('classId') classId: string) { return this.svc.listSections(tid, sid, classId); }

  @Post('sections') @Roles('SCHOOL_ADMIN')
  createSection(@TenantId() tid: string, @Query('schoolId') sid: string, @Body() dto: any) { return this.svc.createSection(tid, sid, dto); }

  // Subjects
  @Get('subjects') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT')
  subjects(@TenantId() tid: string, @Query('schoolId') sid: string) { return this.svc.listSubjects(tid, sid); }

  @Post('subjects') @Roles('SCHOOL_ADMIN')
  createSubject(@TenantId() tid: string, @Query('schoolId') sid: string, @Body() dto: any) { return this.svc.createSubject(tid, sid, dto); }

  // Staff
  @Get('staff') @Roles('SCHOOL_ADMIN')
  staff(@TenantId() tid: string, @Query('schoolId') sid: string, @Query('page') p: number, @Query('limit') l: number, @Query('search') s: string) { return this.svc.listStaff(tid, sid, p, l, s); }

  @Post('staff') @Roles('SCHOOL_ADMIN')
  createStaff(@TenantId() tid: string, @Query('schoolId') sid: string, @Body() dto: any) { return this.svc.createStaff(tid, sid, dto); }

  // Events
  @Get('events') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT')
  events(@TenantId() tid: string, @Query('schoolId') sid: string, @Query('upcoming') upcoming: string) { return this.svc.listEvents(tid, sid, upcoming === 'true'); }

  @Post('events') @Roles('SCHOOL_ADMIN','TEACHER')
  createEvent(@TenantId() tid: string, @Query('schoolId') sid: string, @Body() dto: any) { return this.svc.createEvent(tid, sid, dto); }

  @Delete('events/:id') @Roles('SCHOOL_ADMIN')
  deleteEvent(@TenantId() tid: string, @Param('id') id: string) { return this.svc.deleteEvent(tid, id); }

  // Announcements
  @Get('announcements') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT')
  announcements(@TenantId() tid: string, @Query('page') p: number, @Query('limit') l: number) { return this.svc.listAnnouncements(tid, p, l); }

  @Post('announcements') @Roles('SCHOOL_ADMIN','TEACHER')
  createAnnouncement(@TenantId() tid: string, @CurrentUser() u: any, @Body() dto: any) { return this.svc.createAnnouncement(tid, u?.sub ?? u?.id, dto); }

  // Departments
  @Get('departments') @Roles('SCHOOL_ADMIN','TEACHER')
  departments(@TenantId() tid: string, @Query('schoolId') sid: string) { return this.svc.listDepartments(tid, sid); }
}
