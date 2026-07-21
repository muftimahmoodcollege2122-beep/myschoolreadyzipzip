import { Module } from '@nestjs/common';
import { FeesService } from './fees.service';
import { FeesController } from './fees.controller';
import { FeesRealtimeInterceptor } from './fees.realtime.interceptor';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../database/prisma.service';
import { RealtimeModule } from '../../realtime/realtime.module';

@Module({
  imports: [RealtimeModule],
  controllers: [FeesController],
  providers: [FeesService, PrismaService, AuditService, FeesRealtimeInterceptor],
  exports: [FeesService],
})
export class FeesModule {}
