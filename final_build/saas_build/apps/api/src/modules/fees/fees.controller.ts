import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FeesService } from './fees.service';
import { CreateInvoiceDto, RecordPaymentDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
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

  @Post('payments') @Roles('SCHOOL_ADMIN','ACCOUNTANT')
  recordPayment(@Body() dto: RecordPaymentDto & { invoiceId: string }, @TenantId() tid: string, @CurrentUser() u: any) {
    return this.svc.recordPayment(dto, tid, u.sub);
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
