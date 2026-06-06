import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DiscountsService } from './discounts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Discounts & Scholarships') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('discounts')
export class DiscountsController {
  constructor(private readonly svc: DiscountsService) {}
  @Post() @Roles('SCHOOL_ADMIN') createDiscount(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.createDiscount(dto, tid, u.sub); }
  @Get() @Roles('SCHOOL_ADMIN') listDiscounts(@TenantId() tid: string) { return this.svc.listDiscounts(tid); }
  @Put(':id') @Roles('SCHOOL_ADMIN') updateDiscount(@Param('id') id: string, @Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.updateDiscount(id, dto, tid, u.sub); }
  @Delete(':id') @Roles('SCHOOL_ADMIN') deleteDiscount(@Param('id') id: string, @TenantId() tid: string) { return this.svc.deleteDiscount(id, tid); }
  @Post('scholarships') @Roles('SCHOOL_ADMIN') createScholarship(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.createScholarship(dto, tid, u.sub); }
  @Get('scholarships') @Roles('SCHOOL_ADMIN') listScholarships(@TenantId() tid: string) { return this.svc.listScholarships(tid); }
  @Put('scholarships/:id') @Roles('SCHOOL_ADMIN') updateScholarship(@Param('id') id: string, @Body() dto: any, @TenantId() tid: string) { return this.svc.updateScholarship(id, dto, tid); }
  @Post('scholarships/grant') @Roles('SCHOOL_ADMIN') grantScholarship(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.grantScholarship(dto, tid, u.sub); }
  @Get('scholarships/grants') @Roles('SCHOOL_ADMIN') listGrants(@TenantId() tid: string, @Query('studentId') sid?: string) { return this.svc.listGrants(tid, sid); }
  @Put('scholarships/grants/:id/revoke') @Roles('SCHOOL_ADMIN') revokeGrant(@Param('id') id: string, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.revokeGrant(id, tid, u.sub); }
  @Post('installment-plans') @Roles('SCHOOL_ADMIN') createInstallmentPlan(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.createInstallmentPlan(dto, tid, u.sub); }
  @Get('installment-plans') @Roles('SCHOOL_ADMIN') listInstallmentPlans(@TenantId() tid: string, @Query('studentId') sid?: string) { return this.svc.listInstallmentPlans(tid, sid); }
  @Post('installments/:id/pay') @Roles('SCHOOL_ADMIN') payInstallment(@Param('id') id: string, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.recordInstallmentPayment(id, tid, u.sub); }
  @Post('coupons') @Roles('SUPER_ADMIN') createCoupon(@Body() dto: any) { return this.svc.createCoupon(dto); }
  @Get('coupons') @Roles('SUPER_ADMIN') listCoupons() { return this.svc.listCoupons(); }
  @Post('coupons/validate') validateCoupon(@Body() dto: any) { return this.svc.validateCoupon(dto.code, dto.amount, dto.plan); }
}
