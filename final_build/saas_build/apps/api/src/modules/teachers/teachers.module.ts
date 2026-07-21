import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { AuditService } from '../../common/audit/audit.service';
import { PlanGuard } from '../../common/guards/plan.guard';
import { CacheService } from '../../common/cache/cache.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [TeachersController],
  providers: [TeachersService, AuditService, PlanGuard, CacheService, PrismaService],
  exports: [TeachersService],
})
export class TeachersModule {}
