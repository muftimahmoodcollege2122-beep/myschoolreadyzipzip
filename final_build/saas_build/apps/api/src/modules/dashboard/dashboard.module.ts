import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { CacheService } from '../../common/cache/cache.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, CacheService, PrismaService],
  exports: [DashboardService],
})
export class DashboardModule {}
