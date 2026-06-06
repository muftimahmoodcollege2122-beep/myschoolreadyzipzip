import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AlumniService } from './alumni.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Alumni') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('alumni')
export class AlumniController {
  constructor(private readonly svc: AlumniService) {}
  @Post() @Roles('SCHOOL_ADMIN') create(@Body() dto: any, @TenantId() tid: string) { return this.svc.create(dto, tid); }
  @Get() findAll(@TenantId() tid: string, @Query('schoolId') sid?: string, @Query('year') year?: string, @Query('search') search?: string, @Query('page') page?: string) { return this.svc.findAll(tid, sid, year ? +year : undefined, search, page ? +page : 1); }
  @Get('stats') @Roles('SCHOOL_ADMIN') getStats(@TenantId() tid: string, @Query('schoolId') sid?: string) { return this.svc.getStats(tid, sid); }
  @Get(':id') findOne(@Param('id') id: string, @TenantId() tid: string) { return this.svc.findOne(id, tid); }
  @Put(':id') @Roles('SCHOOL_ADMIN') update(@Param('id') id: string, @Body() dto: any, @TenantId() tid: string) { return this.svc.update(id, dto, tid); }
  @Put(':id/verify') @Roles('SCHOOL_ADMIN') verify(@Param('id') id: string, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.verify(id, tid, u.sub); }
  @Delete(':id') @Roles('SCHOOL_ADMIN') delete(@Param('id') id: string, @TenantId() tid: string) { return this.svc.delete(id, tid); }
}
