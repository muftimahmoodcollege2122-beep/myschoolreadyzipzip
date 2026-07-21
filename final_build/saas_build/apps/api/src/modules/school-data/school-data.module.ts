import { Module } from '@nestjs/common';
import { SchoolDataController } from './school-data.controller';
import { SchoolDataService } from './school-data.service';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';

@Module({ controllers: [SchoolDataController], providers: [SchoolDataService, PrismaService, CacheService] })
export class SchoolDataModule {}
