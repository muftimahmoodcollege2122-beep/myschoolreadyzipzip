import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, ParseUUIDPipe, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { FeesService } from './fees.service';
import { CreateInvoiceDto, RecordPaymentDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Throttle } from '../../common/guards/throttle.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Fees') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('fees')
export class FeesController {
  constructor(private readonly svc: FeesService) {}

  @Post('invoices') @Roles('SCHOOL_ADMIN','ACCOUNTANT')
  createInvoice(@Body() dto: CreateInvoiceDto, @TenantId() tid: string) { return this.svc.createInvoice(dto, tid); }

  @Post('direct-invoice') @Roles('SCHOOL_ADMIN','ACCOUNTANT')
  createDirectInvoice(@Body() dto: any, @TenantId() tid: string) { return this.svc.createDirectInvoice(dto, tid); }

  @Patch('invoices/:id') @Roles('SCHOOL_ADMIN','ACCOUNTANT')
  @ApiOperation({ summary: 'Edit an existing fee invoice (amount, due date, discount, fine, notes)' })
  editInvoice(@Param('id', ParseUUIDPipe) id: string, @TenantId() tid: string, @Body() dto: any, @CurrentUser() u: any) {
    return this.svc.editInvoice(id, tid, dto, u.sub);
  }

  @Post('payments') @Roles('SCHOOL_ADMIN','ACCOUNTANT')
  recordPayment(@Body() dto: RecordPaymentDto & { invoiceId: string }, @TenantId() tid: string, @CurrentUser() u: any) {
    return this.svc.recordPayment(dto, tid, u.sub);
  }

  // ── Bulk import / export ────────────────────────────────────────────────
  @Get('bulk-import/template') @Roles('SCHOOL_ADMIN','ACCOUNTANT')
  @ApiOperation({ summary: 'Download the .xlsx template for bulk fee invoice import' })
  downloadImportTemplate(@Res() res: Response) {
    const buffer = this.svc.getImportTemplate();
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': 'attachment; filename=fees-import-template.xlsx' });
    res.send(buffer);
  }
  @Post('bulk-import') @Roles('SCHOOL_ADMIN','ACCOUNTANT') @Throttle(5, 300)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'Bulk import fee invoices from an uploaded .xlsx/.csv file' })
  bulkImport(@UploadedFile() file: Express.Multer.File, @TenantId() tid: string, @CurrentUser() u: any) {
    if (!file) throw new Error('No file uploaded. Please attach a .xlsx or .csv file.');
    return this.svc.bulkImport(file.buffer, tid, u.sub);
  }
  @Get('export/excel') @Roles('SCHOOL_ADMIN','ACCOUNTANT')
  @ApiOperation({ summary: 'Export fee invoices to .xlsx' })
  async exportExcel(@TenantId() tid: string, @Query('schoolId') sid: string, @Res() res: Response) {
    const buffer = await this.svc.exportToExcel(tid, sid);
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename=fee-invoices-${new Date().toISOString().slice(0, 10)}.xlsx` });
    res.send(buffer);
  }

  @Get('student/:studentId') @Roles('SCHOOL_ADMIN','ACCOUNTANT','STUDENT','PARENT')
  studentFees(@Param('studentId', ParseUUIDPipe) id: string, @TenantId() tid: string) { return this.svc.getStudentFeeSummary(id, tid); }

  @Get('revenue') @Roles('SCHOOL_ADMIN','ACCOUNTANT')
  revenue(@Query('schoolId') sid: string, @Query('month') m: number, @Query('year') y: number, @TenantId() tid: string) {
    return this.svc.getRevenueReport(sid, tid, m, y);
  }

  @Get('outstanding') @Roles('SCHOOL_ADMIN','ACCOUNTANT')
  outstanding(@Query('schoolId') sid: string, @TenantId() tid: string) { return this.svc.getOutstandingInvoices(sid, tid); }
}
