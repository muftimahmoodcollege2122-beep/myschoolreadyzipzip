import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { CacheService } from '../../common/cache/cache.service';
import { PrismaService } from '../../database/prisma.service';
import { ReplicaService } from '../../database/replica.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, CacheService, PrismaService, ReplicaService],
  exports: [DashboardService],
})
export class DashboardModule {}
