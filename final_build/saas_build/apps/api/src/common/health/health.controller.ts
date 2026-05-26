import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../cache/cache.service';
import { Public } from '../decorators/tenant-id.decorator';

@Public()
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService, private cache: CacheService) {}

  @Get('live')
  liveness() { return { status: 'ok', uptime: process.uptime(), ts: new Date().toISOString() }; }

  @Get('ready')
  async readiness() {
    const checks: Record<string, any> = {};
    try { await this.prisma.$queryRaw`SELECT 1`; checks.db = 'ok'; } catch { checks.db = 'fail'; }
    try { await this.cache.set('__health', '1', 5); checks.redis = 'ok'; } catch { checks.redis = 'fail'; }
    const ok = Object.values(checks).every(v => v === 'ok');
    return { status: ok ? 'ok' : 'degraded', checks, ts: new Date().toISOString() };
  }

  @Get()
  full() { return { status: 'ok', version: process.env.npm_package_version ?? '1.0.0', env: process.env.NODE_ENV, ts: new Date().toISOString() }; }
}
