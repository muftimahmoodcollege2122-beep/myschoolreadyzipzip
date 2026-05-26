import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { CacheService } from '../../common/cache/cache.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, CacheService, PrismaService],
  exports: [SearchService],
})
export class SearchModule {}
