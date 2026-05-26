import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [HealthController],
  providers: [CacheService, PrismaService],
})
export class HealthModule {}
