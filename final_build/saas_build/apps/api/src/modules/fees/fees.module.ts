import { Module } from '@nestjs/common';
import { FeesService } from './fees.service';
import { FeesController } from './fees.controller';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../database/prisma.service';

@Module({ controllers: [FeesController], providers: [FeesService, PrismaService, AuditService], exports: [FeesService] })
export class FeesModule {}
