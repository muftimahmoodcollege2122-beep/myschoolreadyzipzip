import { Module } from '@nestjs/common';
import { PaymentGatewayController } from './payment-gateway.controller';
import { PaymentGatewayService } from './payment-gateway.service';
import { EasypaisaProvider } from './providers/easypaisa.provider';
import { JazzCashProvider } from './providers/jazzcash.provider';
import { BankTransferProvider } from './providers/bank-transfer.provider';
import { PayPalProvider } from './providers/paypal.provider';
import { PrismaService } from '../../database/prisma.service';
import { EventPublisher } from '../../events/event-publisher.service';
import { CacheService } from '../../common/cache/cache.service';

@Module({
  controllers: [PaymentGatewayController],
  providers: [
    PaymentGatewayService,
    EasypaisaProvider,
    JazzCashProvider,
    BankTransferProvider,
    PayPalProvider,
    PrismaService,
    EventPublisher,
    CacheService,
  ],
  exports: [PaymentGatewayService],
})
export class PaymentGatewayModule {}
