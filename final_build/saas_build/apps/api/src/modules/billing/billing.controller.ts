import { Controller, Get, Post, Body, UseGuards, Req, Headers, HttpCode, RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Request } from 'express';

@ApiTags('Billing') @Controller('billing')
export class BillingController {
  constructor(private readonly svc: BillingService) {}
  @Post('checkout') @UseGuards(JwtAuthGuard, RolesGuard) @ApiBearerAuth() @Roles('SCHOOL_ADMIN')
  checkout(@Body() dto: { plan: string }, @TenantId() tid: string) { return this.svc.createCheckoutSession(tid, dto.plan as any); }
  @Post('portal') @UseGuards(JwtAuthGuard, RolesGuard) @ApiBearerAuth() @Roles('SCHOOL_ADMIN')
  portal(@TenantId() tid: string) { return this.svc.createPortalSession(tid); }
  @Get('subscription') @UseGuards(JwtAuthGuard, RolesGuard) @ApiBearerAuth() @Roles('SCHOOL_ADMIN')
  subscription(@TenantId() tid: string) { return this.svc.getSubscription(tid); }
  @Post('webhook') @HttpCode(200)
  webhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') sig: string) { return this.svc.handleWebhook(req.rawBody ?? Buffer.alloc(0), sig); }
}
