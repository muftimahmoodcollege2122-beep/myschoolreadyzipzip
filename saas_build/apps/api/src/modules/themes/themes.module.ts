import { Module } from '@nestjs/common';
import { ThemesService } from './themes.service';
import { ThemesController } from './themes.controller';
import { CacheService } from '../../common/cache/cache.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [ThemesController],
  providers: [ThemesService, CacheService, PrismaService],
  exports: [ThemesService],
})
export class ThemesModule {}
