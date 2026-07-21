import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'reports' })],
  controllers: [GradesController],
  providers: [GradesService, PrismaService, AuditService],
  exports: [GradesService],
})
export class GradesModule {}
