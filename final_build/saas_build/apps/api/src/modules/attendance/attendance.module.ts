import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AuditService } from '../../common/audit/audit.service';
import { EventPublisher } from '../../events/event-publisher.service';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'notifications' })],
  controllers: [AttendanceController],
  providers: [AttendanceService, PrismaService, AuditService, EventPublisher, NotificationsService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
