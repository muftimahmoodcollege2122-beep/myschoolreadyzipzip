import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FormsService } from './forms.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Forms & Policies') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('forms')
export class FormsController {
  constructor(private readonly svc: FormsService) {}
  @Post() @Roles('SCHOOL_ADMIN') createForm(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.createForm(dto, tid, u.sub); }
  @Get() listForms(@TenantId() tid: string, @Query('schoolId') sid?: string) { return this.svc.listForms(tid, sid); }
  @Get(':id') getForm(@Param('id') id: string, @TenantId() tid: string) { return this.svc.getForm(id, tid); }
  @Put(':id') @Roles('SCHOOL_ADMIN') updateForm(@Param('id') id: string, @Body() dto: any, @TenantId() tid: string) { return this.svc.updateForm(id, dto, tid); }
  @Delete(':id') @Roles('SCHOOL_ADMIN') deleteForm(@Param('id') id: string, @TenantId() tid: string) { return this.svc.deleteForm(id, tid); }
  @Post(':id/submit') submitResponse(@Param('id') id: string, @Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.submitResponse(id, dto.data, tid, u.sub); }
  @Get(':id/responses') @Roles('SCHOOL_ADMIN') getResponses(@Param('id') id: string, @TenantId() tid: string) { return this.svc.getResponses(id, tid); }
  @Get(':id/stats') @Roles('SCHOOL_ADMIN') getStats(@Param('id') id: string, @TenantId() tid: string) { return this.svc.getResponseStats(id, tid); }
  @Post('policies') @Roles('SCHOOL_ADMIN') createPolicy(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.createPolicy(dto, tid, u.sub); }
  @Get('policies/list') listPolicies(@TenantId() tid: string, @Query('schoolId') sid?: string, @Query('category') cat?: string) { return this.svc.listPolicies(tid, sid, cat); }
  @Put('policies/:id/publish') @Roles('SCHOOL_ADMIN') publishPolicy(@Param('id') id: string, @TenantId() tid: string) { return this.svc.publishPolicy(id, tid); }
  @Put('policies/:id') @Roles('SCHOOL_ADMIN') updatePolicy(@Param('id') id: string, @Body() dto: any, @TenantId() tid: string) { return this.svc.updatePolicy(id, dto, tid); }
  @Get('checklist/current') getChecklist(@TenantId() tid: string) { return this.svc.getChecklist(tid); }
  @Put('checklist/item') @Roles('SCHOOL_ADMIN') updateChecklistItem(@TenantId() tid: string, @Body() dto: any) { return this.svc.updateChecklistItem(tid, dto.key, dto.done); }
  @Post('academic-rules') @Roles('SCHOOL_ADMIN') createRule(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.createAcademicRule(dto, tid, u.sub); }
  @Get('academic-rules/list') listRules(@TenantId() tid: string, @Query('schoolId') sid?: string, @Query('type') type?: string) { return this.svc.listAcademicRules(tid, sid, type); }
}
