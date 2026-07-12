import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceRealtimeInterceptor } from './attendance.realtime.interceptor';
import { AuditService } from '../../common/audit/audit.service';
import { EventPublisher } from '../../events/event-publisher.service';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RealtimeModule } from '../../realtime/realtime.module';

@Module({
  imports: [BullModule.registerQueue({ name: 'notifications' }), RealtimeModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, PrismaService, AuditService, EventPublisher, NotificationsService, AttendanceRealtimeInterceptor],
  exports: [AttendanceService],
})
export class AttendanceModule {}
