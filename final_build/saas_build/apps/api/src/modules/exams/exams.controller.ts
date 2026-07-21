import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Exams') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('exams')
export class ExamsController {
  constructor(private readonly svc: ExamsService) {}
  @Post() @Roles('SCHOOL_ADMIN','TEACHER') create(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.create(dto, tid, u.sub); }
  @Get() @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT') findAll(@TenantId() tid: string, @Query('sectionId') sid?: string, @Query('academicYear') y?: string) { return this.svc.findAll(tid, sid, y); }
  @Get(':id') @Roles('SCHOOL_ADMIN','TEACHER') findOne(@Param('id', ParseUUIDPipe) id: string, @TenantId() tid: string) { return this.svc.findOne(id, tid); }
  @Post(':id/results') @Roles('TEACHER','SCHOOL_ADMIN') enterResults(@Param('id', ParseUUIDPipe) id: string, @Body() dto: { results: any[] }, @TenantId() tid: string) { return this.svc.enterResults(id, dto.results, tid); }
  @Get(':id/results') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT') getResults(@Param('id', ParseUUIDPipe) id: string, @TenantId() tid: string) { return this.svc.getSectionResults(id, tid); }
}
