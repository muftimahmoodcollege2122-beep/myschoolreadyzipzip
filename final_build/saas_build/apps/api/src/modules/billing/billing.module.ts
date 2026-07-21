import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { EventPublisher } from '../../events/event-publisher.service';
import { CacheService } from '../../common/cache/cache.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [BillingController],
  providers: [BillingService, PrismaService, EventPublisher, CacheService],
  exports: [BillingService],
})
export class BillingModule {}
