import { Module } from '@nestjs/common';
import { AlumniController } from './alumni.controller';
import { AlumniService } from './alumni.service';
import { PrismaService } from '../../database/prisma.service';

@Module({ controllers: [AlumniController], providers: [AlumniService, PrismaService], exports: [AlumniService] })
export class AlumniModule {}
