import { Module } from '@nestjs/common';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({ controllers: [SecurityController], providers: [SecurityService, PrismaService, AuditService], exports: [SecurityService] })
export class SecurityModule {}
