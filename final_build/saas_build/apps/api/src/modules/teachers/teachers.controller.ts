import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, ParseUUIDPipe, HttpCode, HttpStatus, Req, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Throttle } from '../../common/guards/throttle.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Request, Response } from 'express';

@ApiTags('Teachers') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('teachers')
export class TeachersController {
  constructor(private readonly svc: TeachersService) {}
  @Post() @Roles('SCHOOL_ADMIN') @Throttle(30, 60)
  create(@Body() dto: CreateTeacherDto, @TenantId() tid: string, @CurrentUser() u: any, @Req() req: Request) { return this.svc.create(dto, tid, req.query.schoolId as string, u.sub); }

  // ── Bulk import / export ────────────────────────────────────────────────
  @Get('bulk-import/template') @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Download the .xlsx template for bulk teacher import' })
  downloadImportTemplate(@Res() res: Response) {
    const buffer = this.svc.getImportTemplate();
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': 'attachment; filename=teachers-import-template.xlsx' });
    res.send(buffer);
  }
  @Post('bulk-import') @Roles('SCHOOL_ADMIN') @Throttle(5, 300)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'Bulk import teachers from an uploaded .xlsx/.csv file' })
  bulkImport(@UploadedFile() file: Express.Multer.File, @TenantId() tid: string, @Query('schoolId') sid: string, @CurrentUser() u: any) {
    if (!file) throw new Error('No file uploaded. Please attach a .xlsx or .csv file.');
    return this.svc.bulkImport(file.buffer, tid, sid, u.sub);
  }
  @Get('export/excel') @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Export all active teachers to .xlsx' })
  async exportExcel(@TenantId() tid: string, @Query('schoolId') sid: string, @Res() res: Response) {
    const buffer = await this.svc.exportToExcel(tid, sid);
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename=teachers-${new Date().toISOString().slice(0, 10)}.xlsx` });
    res.send(buffer);
  }

  @Get('me') @Roles('TEACHER','SCHOOL_ADMIN')
  findMe(@TenantId() tid: string, @CurrentUser() u: any) { return this.svc.findByUserId(u.sub, tid); }
  @Get() @Roles('SCHOOL_ADMIN')
  findAll(@TenantId() tid: string, @Query('schoolId') sid: string, @Query('page') p: number, @Query('limit') l: number, @Query('search') s: string) { return this.svc.findAll(tid, sid, p, l, s); }
  @Get(':id') @Roles('SCHOOL_ADMIN','TEACHER')
  findOne(@Param('id', ParseUUIDPipe) id: string, @TenantId() tid: string) { return this.svc.findOne(id, tid); }
  @Delete(':id') @Roles('SCHOOL_ADMIN') @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a teacher' })
  deactivate(@Param('id', ParseUUIDPipe) id: string, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.deactivate(id, tid, u.sub); }
  @Get(':id/schedule') @Roles('SCHOOL_ADMIN','TEACHER')
  schedule(@Param('id', ParseUUIDPipe) id: string, @TenantId() tid: string) { return this.svc.getTeacherSchedule(id, tid); }
  @Get('leaves/my') @Roles('TEACHER','SCHOOL_ADMIN')
  myLeaves(@TenantId() tid: string, @CurrentUser() u: any) { return this.svc.myLeaveRequests(u.sub, tid); }
  @Post('leaves') @Roles('TEACHER','SCHOOL_ADMIN')
  requestMyLeave(@TenantId() tid: string, @CurrentUser() u: any, @Body() dto: any) { return this.svc.requestMyLeave(u.sub, tid, dto); }
  @Post(':id/leaves') @Roles('TEACHER','SCHOOL_ADMIN')
  requestLeave(@Param('id', ParseUUIDPipe) id: string, @TenantId() tid: string, @Body() dto: any) { return this.svc.requestLeave(id, tid, dto); }
  @Post('leaves/:id/approve') @Roles('SCHOOL_ADMIN')
  approveLeave(@Param('id', ParseUUIDPipe) id: string, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.approveLeave(id, tid, u.sub); }
}
