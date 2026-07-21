import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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

  @Get('roles-overview') @Roles('SCHOOL_ADMIN')
  getRolesOverview(@TenantId() tid: string) { return this.svc.getRolesOverview(tid); }

  @Get('stats') @Roles('SCHOOL_ADMIN','TEACHER')
  @ApiOperation({ summary: 'Real counts backing the dashboard stat cards: students, teachers, classes, overdue invoices' })
  getStats(@TenantId() tid: string, @Query('schoolId') sid?: string) { return this.svc.getSchoolStats(tid, sid); }

  @Get('payment-gateway-settings') @Roles('SCHOOL_ADMIN')
  getPaymentGatewaySettings(@TenantId() tid: string) { return this.svc.getPaymentGatewaySettings(tid); }

  @Put('payment-gateway-settings/:gateway') @Roles('SCHOOL_ADMIN')
  updatePaymentGatewaySettings(@TenantId() tid: string, @Param('gateway') gateway: string, @Body() dto: any) { return this.svc.updatePaymentGatewaySettings(tid, gateway, dto); }

  @Get('notification-settings') @Roles('SCHOOL_ADMIN')
  getNotificationSettings(@TenantId() tid: string) { return this.svc.getNotificationSettings(tid); }

  @Put('notification-settings/:channel') @Roles('SCHOOL_ADMIN')
  updateNotificationSettings(@TenantId() tid: string, @Param('channel') channel: 'sms' | 'email', @Body() dto: any) { return this.svc.updateNotificationSettings(tid, channel, dto); }

  // ── Generic Section CRUD — used by: academic-calendar, canteen, certificates,
  // clubs, documents, duty-roster, hostel, id-cards, inventory, medical, notices,
  // parents, payroll, research, sports
  @Get('section/:section') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT')
  getSection(@TenantId() tid: string, @Param('section') section: string) { return this.svc.getSection(tid, section); }

  @Post('section/:section') @Roles('SCHOOL_ADMIN','TEACHER')
  createSectionItem(@TenantId() tid: string, @Param('section') section: string, @Body() dto: any) { return this.svc.createSectionItem(tid, section, dto); }

  @Put('section/:section/:itemId') @Roles('SCHOOL_ADMIN','TEACHER')
  updateSectionItem(@TenantId() tid: string, @Param('section') section: string, @Param('itemId') itemId: string, @Body() dto: any) { return this.svc.updateSectionItem(tid, section, itemId, dto); }

  @Delete('section/:section/:itemId') @Roles('SCHOOL_ADMIN','TEACHER')
  deleteSectionItem(@TenantId() tid: string, @Param('section') section: string, @Param('itemId') itemId: string) { return this.svc.deleteSectionItem(tid, section, itemId); }

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

  @Delete('announcements/:id') @Roles('SCHOOL_ADMIN')
  deleteAnnouncement(@TenantId() tid: string, @Param('id') id: string) { return this.svc.deleteAnnouncement(tid, id); }

  // Departments
  @Get('departments') @Roles('SCHOOL_ADMIN','TEACHER')
  departments(@TenantId() tid: string, @Query('schoolId') sid: string) { return this.svc.listDepartments(tid, sid); }

  // LMS
  @Get('lms') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT')
  getLms(@TenantId() tid: string) { return this.svc.getLmsData(tid); }

  @Post('lms') @Roles('SCHOOL_ADMIN','TEACHER')
  createCourse(@TenantId() tid: string, @Body() dto: any) { return this.svc.createLmsCourse(tid, dto); }

  @Put('lms/:id') @Roles('SCHOOL_ADMIN','TEACHER')
  updateCourse(@TenantId() tid: string, @Param('id') id: string, @Body() dto: any) { return this.svc.updateLmsCourse(tid, id, dto); }

  @Delete('lms/:id') @Roles('SCHOOL_ADMIN')
  deleteCourse(@TenantId() tid: string, @Param('id') id: string) { return this.svc.deleteLmsCourse(tid, id); }

  // Website Settings
  @Get('website-settings') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT')
  getWebsite(@TenantId() tid: string) { return this.svc.getWebsiteSettings(tid); }

  @Put('website-settings') @Roles('SCHOOL_ADMIN')
  saveWebsite(@TenantId() tid: string, @Body() dto: any) { return this.svc.saveWebsiteSettings(tid, dto); }

  // Backup
  @Get('backup') @Roles('SCHOOL_ADMIN')
  backup(@TenantId() tid: string) { return this.svc.getBackup(tid); }
}
