import {
  Controller, Post, Get, Body, Param, Query,
  UseGuards, HttpCode, Headers, Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentGatewayService } from './payment-gateway.service';
import { InitiatePaymentDto, VerifyPaymentDto } from './dto/initiate-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Payment Gateway')
@Controller('payments')
export class PaymentGatewayController {
  constructor(private readonly svc: PaymentGatewayService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get all plan prices in PKR and USD' })
  getPlanPrices() {
    return this.svc.getPlanPrices();
  }

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a payment via EasyPaisa, JazzCash, Bank, IBAN, or PayPal' })
  initiatePayment(@Body() dto: InitiatePaymentDto) {
    return this.svc.initiatePayment(dto);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Submit payment proof for manual verification' })
  verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.svc.verifyPayment(dto);
  }

  @Post('paypal/capture')
  @ApiOperation({ summary: 'Capture a PayPal order after user approval' })
  capturePayPal(
    @Query('token') paypalOrderId: string,
    @Query('orderId') internalOrderId: string,
  ) {
    return this.svc.capturePayPal(paypalOrderId, internalOrderId);
  }

  @Post('jazzcash/webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'JazzCash payment webhook' })
  jazzCashWebhook(@Body() payload: Record<string, string>) {
    return this.svc.handleJazzCashWebhook(payload);
  }

  @Get('admin/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all pending manual payment verifications (Super Admin)' })
  getPendingVerifications() {
    return this.svc.getPendingVerifications();
  }

  @Post('admin/approve/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Approve a manual payment and activate tenant (Super Admin)' })
  approvePayment(@Param('id') id: string) {
    return this.svc.approveManualPayment(id);
  }
}
