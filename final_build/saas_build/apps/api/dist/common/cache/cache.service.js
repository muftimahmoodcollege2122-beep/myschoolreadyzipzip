"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let CacheService = CacheService_1 = class CacheService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(CacheService_1.name);
        this.isDown = false;
        this.PREFIX = 'school:';
    }
    async onModuleInit() {
        this.client = new ioredis_1.default({
            host: this.config.get('REDIS_HOST', 'localhost'),
            port: this.config.get('REDIS_PORT', 6379),
            password: this.config.get('REDIS_PASSWORD') || undefined,
            db: this.config.get('REDIS_DB', 0),
            keyPrefix: this.PREFIX,
            enableReadyCheck: true,
            maxRetriesPerRequest: 2,
            connectTimeout: 3000,
            commandTimeout: 2000,
            retryStrategy: (times) => times > 10 ? null : Math.min(times * 200, 3000),
            enableOfflineQueue: false,
        });
        this.client.on('error', (err) => { this.logger.error(`Redis: ${err.message}`); this.isDown = true; });
        this.client.on('connect', () => { this.logger.log('Redis connected'); this.isDown = false; });
        this.client.on('ready', () => { this.isDown = false; });
        this.client.on('reconnecting', () => { this.logger.warn('Redis reconnecting'); this.isDown = true; });
        this.client.on('close', () => { this.isDown = true; });
    }
    async onModuleDestroy() {
        await this.client.quit();
    }
    async get(key) {
        if (this.isDown)
            return null;
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch {
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        if (this.isDown)
            return;
        try {
            const s = JSON.stringify(value);
            if (ttlSeconds)
                await this.client.setex(key, ttlSeconds, s);
            else
                await this.client.set(key, s);
        }
        catch { }
    }
    async del(key) {
        if (this.isDown)
            return;
        try {
            await this.client.del(key);
        }
        catch { }
    }
    async delPattern(pattern) {
        if (this.isDown)
            return;
        try {
            const fullPattern = `${this.PREFIX}${pattern}`;
            let cursor = '0';
            do {
                const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', fullPattern, 'COUNT', 100);
                cursor = nextCursor;
                if (keys.length > 0) {
                    const stripped = keys.map(k => k.replace(this.PREFIX, ''));
                    await this.client.del(...stripped);
                }
            } while (cursor !== '0');
        }
        catch (err) {
            this.logger.warn(`Cache delPattern failed for ${pattern}: ${err}`);
        }
    }
    async mget(keys) {
        if (this.isDown || keys.length === 0)
            return keys.map(() => null);
        try {
            const values = await this.client.mget(...keys);
            return values.map(v => (v ? JSON.parse(v) : null));
        }
        catch {
            return keys.map(() => null);
        }
    }
    async mset(entries) {
        if (this.isDown || entries.length === 0)
            return;
        try {
            const pipeline = this.client.pipeline();
            for (const { key, value, ttl } of entries) {
                const s = JSON.stringify(value);
                if (ttl)
                    pipeline.setex(key, ttl, s);
                else
                    pipeline.set(key, s);
            }
            await pipeline.exec();
        }
        catch { }
    }
    async remember(key, ttl, fn) {
        const cached = await this.get(key);
        if (cached !== null)
            return cached;
        const value = await fn();
        await this.set(key, value, ttl);
        return value;
    }
    async increment(key, ttlSeconds) {
        if (this.isDown)
            return 0;
        try {
            const value = await this.client.incr(key);
            if (ttlSeconds && value === 1)
                await this.client.expire(key, ttlSeconds);
            return value;
        }
        catch {
            return 0;
        }
    }
    async ping() {
        try {
            return (await this.client.ping()) === 'PONG';
        }
        catch {
            return false;
        }
    }
    get healthy() { return !this.isDown; }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CacheService);
//# sourceMappingURL=cache.service.js.map