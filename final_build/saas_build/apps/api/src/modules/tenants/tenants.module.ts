import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { CacheService } from '../../common/cache/cache.service';
import { AuditService } from '../../common/audit/audit.service';
import { EventPublisher } from '../../events/event-publisher.service';
import { PrismaService } from '../../database/prisma.service';

@Module({ controllers: [TenantsController], providers: [TenantsService, PrismaService, CacheService, AuditService, EventPublisher], exports: [TenantsService] })
export class TenantsModule {}
