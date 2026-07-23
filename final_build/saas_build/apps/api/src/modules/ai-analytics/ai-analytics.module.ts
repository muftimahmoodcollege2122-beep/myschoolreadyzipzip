import { Module } from '@nestjs/common';
import { AiAnalyticsController } from './ai-analytics.controller';
import { AiAnalyticsService } from './ai-analytics.service';
import { PrismaService } from '../../database/prisma.service';
import { ReplicaService } from '../../database/replica.service';

@Module({ controllers: [AiAnalyticsController], providers: [AiAnalyticsService, PrismaService, ReplicaService], exports: [AiAnalyticsService] })
export class AiAnalyticsModule {}
