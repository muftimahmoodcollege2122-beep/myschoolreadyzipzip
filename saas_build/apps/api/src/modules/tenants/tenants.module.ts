import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { PublicController } from './public.controller';
import { CacheService } from '../../common/cache/cache.service';
import { AuditService } from '../../common/audit/audit.service';
import { EventPublisher } from '../../events/event-publisher.service';

@Module({
  controllers: [TenantsController, PublicController],
  providers: [TenantsService, CacheService, AuditService, EventPublisher],
  exports: [TenantsService],
})
export class TenantsModule {}
