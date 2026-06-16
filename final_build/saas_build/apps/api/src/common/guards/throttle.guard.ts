import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CacheService } from '../cache/cache.service';

export const THROTTLE_KEY = 'throttle';
export const Throttle = (limit: number, windowSec: number) =>
  Reflect.metadata(THROTTLE_KEY, { limit, windowSec });
export const SkipThrottle = () => Reflect.metadata(THROTTLE_KEY, null);

@Injectable()
export class ThrottleGuard implements CanActivate {
  constructor(private readonly cache: CacheService, private readonly reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const meta = this.reflector.get<{ limit: number; windowSec: number } | null>(THROTTLE_KEY, ctx.getHandler());
    if (meta === null) return true; // SkipThrottle

    const req = ctx.switchToHttp().getRequest();
    const tenantId: string = req.tenantContext?.tenantId ?? 'anon';
    const ip: string = req.ip ?? 'unknown';
    const route = `${req.method}:${req.route?.path ?? req.path}`;

    // Per-tenant + per-IP rate limit
    const { limit, windowSec } = meta ?? { limit: 60, windowSec: 60 };
    const tenantKey = `rl:tenant:${tenantId}:${route}`;
    const ipKey     = `rl:ip:${ip}:${route}`;

    const [tenantCount, ipCount] = await Promise.all([
      this.cache.increment(tenantKey, windowSec),
      this.cache.increment(ipKey, windowSec),
    ]);

    // IP limit is 3× tenant limit (one IP could be a school's proxy)
    if (tenantCount > limit || ipCount > limit * 3) {
      throw new HttpException(
        { statusCode: 429, error: 'Too Many Requests', message: `Rate limit exceeded. Max ${limit} requests per ${windowSec}s.` },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
