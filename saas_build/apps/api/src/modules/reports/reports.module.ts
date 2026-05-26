import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { GradesModule } from '../grades/grades.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { S3StorageService } from '../../common/storage/s3-storage.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'reports' }),
    GradesModule,
    AttendanceModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService, S3StorageService],
  exports: [ReportsService],
})
export class ReportsModule {}
