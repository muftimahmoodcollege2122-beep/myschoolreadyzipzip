import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client!: Redis;
  private isDown = false;
  private readonly PREFIX = 'school:';

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    this.client = new Redis({
      host:     this.config.get('REDIS_HOST', 'localhost'),
      port:     this.config.get<number>('REDIS_PORT', 6379),
      password: this.config.get('REDIS_PASSWORD') || undefined,
      db:       this.config.get<number>('REDIS_DB', 0),
      keyPrefix: this.PREFIX,
      enableReadyCheck: true,
      maxRetriesPerRequest: 2,       // fail fast — don't queue up behind a dead Redis
      connectTimeout: 3000,
      commandTimeout: 2000,
      retryStrategy: (times) => times > 10 ? null : Math.min(times * 200, 3000),
      enableOfflineQueue: false,      // reject commands immediately when disconnected
    });

    this.client.on('error',       (err) => { this.logger.error(`Redis: ${err.message}`); this.isDown = true; });
    this.client.on('connect',     ()    => { this.logger.log('Redis connected'); this.isDown = false; });
    this.client.on('ready',       ()    => { this.isDown = false; });
    this.client.on('reconnecting',()    => { this.logger.warn('Redis reconnecting'); this.isDown = true; });
    this.client.on('close',       ()    => { this.isDown = true; });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  /** Get a single key — returns null on cache miss OR Redis failure (graceful degradation) */
  async get<T>(key: string): Promise<T | null> {
    if (this.isDown) return null;
    try {
      const value = await this.client.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }

  /** Set with optional TTL */
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (this.isDown) return;
    try {
      const s = JSON.stringify(value);
      if (ttlSeconds) await this.client.setex(key, ttlSeconds, s);
      else await this.client.set(key, s);
    } catch { /* degrade gracefully */ }
  }

  /** Delete a single key */
  async del(key: string): Promise<void> {
    if (this.isDown) return;
    try { await this.client.del(key); } catch { }
  }

  /**
   * Delete all keys matching a pattern.
   * Uses SCAN instead of KEYS — non-blocking, safe at any dataset size.
   */
  async delPattern(pattern: string): Promise<void> {
    if (this.isDown) return;
    try {
      const fullPattern = `${this.PREFIX}${pattern}`;
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', fullPattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          // Strip the prefix that Redis adds before deleting
          const stripped = keys.map(k => k.replace(this.PREFIX, ''));
          await this.client.del(...stripped);
        }
      } while (cursor !== '0');
    } catch (err) {
      this.logger.warn(`Cache delPattern failed for ${pattern}: ${err}`);
    }
  }

  /**
   * Batch get — uses MGET, one round trip for multiple keys.
   * Critical for dashboard which needs 5+ metrics simultaneously.
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (this.isDown || keys.length === 0) return keys.map(() => null);
    try {
      const values = await this.client.mget(...keys);
      return values.map(v => (v ? (JSON.parse(v) as T) : null));
    } catch {
      return keys.map(() => null);
    }
  }

  /**
   * Batch set — uses pipeline, one round trip.
   */
  async mset(entries: { key: string; value: unknown; ttl?: number }[]): Promise<void> {
    if (this.isDown || entries.length === 0) return;
    try {
      const pipeline = this.client.pipeline();
      for (const { key, value, ttl } of entries) {
        const s = JSON.stringify(value);
        if (ttl) pipeline.setex(key, ttl, s);
        else pipeline.set(key, s);
      }
      await pipeline.exec();
    } catch { }
  }

  /**
   * Cache-aside helper: read from cache, fallback to fn(), populate cache.
   * Reduces boilerplate in every service.
   */
  async remember<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await fn();
    await this.set(key, value, ttl);
    return value;
  }

  /** Atomic increment with optional TTL (for rate limiting) */
  async increment(key: string, ttlSeconds?: number): Promise<number> {
    if (this.isDown) return 0;
    try {
      const value = await this.client.incr(key);
      if (ttlSeconds && value === 1) await this.client.expire(key, ttlSeconds);
      return value;
    } catch { return 0; }
  }

  async ping(): Promise<boolean> {
    try { return (await this.client.ping()) === 'PONG'; } catch { return false; }
  }

  get healthy(): boolean { return !this.isDown; }
}
