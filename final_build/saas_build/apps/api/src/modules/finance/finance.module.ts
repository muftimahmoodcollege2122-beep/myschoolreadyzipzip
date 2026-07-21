import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({ controllers: [FinanceController], providers: [FinanceService, PrismaService, AuditService], exports: [FinanceService] })
export class FinanceModule {}
