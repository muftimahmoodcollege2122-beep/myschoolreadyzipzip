import { Module } from '@nestjs/common';
import { SchoolDataController } from './school-data.controller';
import { SchoolDataService } from './school-data.service';
import { PrismaService } from '../../database/prisma.service';

@Module({ controllers: [SchoolDataController], providers: [SchoolDataService, PrismaService] })
export class SchoolDataModule {}
