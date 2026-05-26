import { Module } from '@nestjs/common';
import { FeesService } from './fees.service';
import { FeesController } from './fees.controller';
import { AuditService } from '../../common/audit/audit.service';
@Module({ controllers: [FeesController], providers: [FeesService, AuditService], exports: [FeesService] })
export class FeesModule {}
