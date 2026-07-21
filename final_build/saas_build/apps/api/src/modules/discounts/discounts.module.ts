import { Module } from '@nestjs/common';
import { DiscountsController } from './discounts.controller';
import { DiscountsService } from './discounts.service';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({ controllers: [DiscountsController], providers: [DiscountsService, PrismaService, AuditService], exports: [DiscountsService] })
export class DiscountsModule {}
