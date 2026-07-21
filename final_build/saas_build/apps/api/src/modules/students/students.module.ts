import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { AuditService } from '../../common/audit/audit.service';
import { PlanGuard } from '../../common/guards/plan.guard';
import { CacheService } from '../../common/cache/cache.service';
import { EventPublisher } from '../../events/event-publisher.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, AuditService, PlanGuard, CacheService, EventPublisher, PrismaService],
  exports: [StudentsService],
})
export class StudentsModule {}
