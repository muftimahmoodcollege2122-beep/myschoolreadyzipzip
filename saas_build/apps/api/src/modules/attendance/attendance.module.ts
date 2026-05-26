import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AuditService } from '../../common/audit/audit.service';
import { EventPublisher } from '../../events/event-publisher.service';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, AuditService, EventPublisher],
  exports: [AttendanceService],
})
export class AttendanceModule {}
