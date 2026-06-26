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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrottleGuard = exports.SkipThrottle = exports.Throttle = exports.THROTTLE_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const cache_service_1 = require("../cache/cache.service");
exports.THROTTLE_KEY = 'throttle';
const Throttle = (limit, windowSec) => Reflect.metadata(exports.THROTTLE_KEY, { limit, windowSec });
exports.Throttle = Throttle;
const SkipThrottle = () => Reflect.metadata(exports.THROTTLE_KEY, null);
exports.SkipThrottle = SkipThrottle;
let ThrottleGuard = class ThrottleGuard {
    constructor(cache, reflector) {
        this.cache = cache;
        this.reflector = reflector;
    }
    async canActivate(ctx) {
        const meta = this.reflector.get(exports.THROTTLE_KEY, ctx.getHandler());
        if (meta === null)
            return true;
        const req = ctx.switchToHttp().getRequest();
        const tenantId = req.tenantContext?.tenantId ?? 'anon';
        const ip = req.ip ?? 'unknown';
        const route = `${req.method}:${req.route?.path ?? req.path}`;
        const { limit, windowSec } = meta ?? { limit: 60, windowSec: 60 };
        const tenantKey = `rl:tenant:${tenantId}:${route}`;
        const ipKey = `rl:ip:${ip}:${route}`;
        const [tenantCount, ipCount] = await Promise.all([
            this.cache.increment(tenantKey, windowSec),
            this.cache.increment(ipKey, windowSec),
        ]);
        if (tenantCount > limit || ipCount > limit * 3) {
            throw new common_1.HttpException({ statusCode: 429, error: 'Too Many Requests', message: `Rate limit exceeded. Max ${limit} requests per ${windowSec}s.` }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        return true;
    }
};
exports.ThrottleGuard = ThrottleGuard;
exports.ThrottleGuard = ThrottleGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cache_service_1.CacheService, core_1.Reflector])
], ThrottleGuard);
//# sourceMappingURL=throttle.guard.js.map