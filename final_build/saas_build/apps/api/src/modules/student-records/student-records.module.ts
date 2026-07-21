import { Module } from '@nestjs/common';
import { StudentRecordsController } from './student-records.controller';
import { StudentRecordsService } from './student-records.service';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({ controllers: [StudentRecordsController], providers: [StudentRecordsService, PrismaService, AuditService], exports: [StudentRecordsService] })
export class StudentRecordsModule {}
