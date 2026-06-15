import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Request } from 'express';

@ApiTags('Teachers') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('teachers')
export class TeachersController {
  constructor(private readonly svc: TeachersService) {}
  @Post() @Roles('SCHOOL_ADMIN')
  create(@Body() dto: CreateTeacherDto, @TenantId() tid: string, @CurrentUser() u: any, @Req() req: Request) { return this.svc.create(dto, tid, req.query.schoolId as string, u.sub); }
  @Get('me') @Roles('TEACHER','SCHOOL_ADMIN')
  findMe(@TenantId() tid: string, @CurrentUser() u: any) { return this.svc.findByUserId(u.sub, tid); }
  @Get() @Roles('SCHOOL_ADMIN')
  findAll(@TenantId() tid: string, @Query('schoolId') sid: string, @Query('page') p: number, @Query('limit') l: number, @Query('search') s: string) { return this.svc.findAll(tid, sid, p, l, s); }
  @Get(':id') @Roles('SCHOOL_ADMIN','TEACHER')
  findOne(@Param('id', ParseUUIDPipe) id: string, @TenantId() tid: string) { return this.svc.findOne(id, tid); }
  @Get(':id/schedule') @Roles('SCHOOL_ADMIN','TEACHER')
  schedule(@Param('id', ParseUUIDPipe) id: string, @TenantId() tid: string) { return this.svc.getTeacherSchedule(id, tid); }
  @Post(':id/leaves') @Roles('TEACHER','SCHOOL_ADMIN')
  requestLeave(@Param('id', ParseUUIDPipe) id: string, @TenantId() tid: string, @Body() dto: any) { return this.svc.requestLeave(id, tid, dto); }
  @Post('leaves/:id/approve') @Roles('SCHOOL_ADMIN')
  approveLeave(@Param('id', ParseUUIDPipe) id: string, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.approveLeave(id, tid, u.sub); }
}
