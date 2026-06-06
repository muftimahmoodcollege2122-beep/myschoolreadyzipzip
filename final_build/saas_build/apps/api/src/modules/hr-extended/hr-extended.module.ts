import { Module } from '@nestjs/common';
import { HrExtendedController } from './hr-extended.controller';
import { HrExtendedService } from './hr-extended.service';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({ controllers: [HrExtendedController], providers: [HrExtendedService, PrismaService, AuditService], exports: [HrExtendedService] })
export class HrExtendedModule {}
