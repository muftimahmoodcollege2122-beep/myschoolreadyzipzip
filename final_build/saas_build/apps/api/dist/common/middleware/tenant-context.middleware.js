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
var TenantContextMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantContextMiddleware = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const cache_service_1 = require("../cache/cache.service");
const BYPASS_PATHS = new Set(['/health', '/health/live', '/health/ready', '/metrics']);
const PUBLIC_PREFIXES = ['/api/v1/public/', '/api/v1/webhooks/', '/api/v1/auth/'];
const TENANT_SLUG_TTL = 600;
const TENANT_DOMAIN_TTL = 300;
let TenantContextMiddleware = TenantContextMiddleware_1 = class TenantContextMiddleware {
    constructor(prisma, cache) {
        this.prisma = prisma;
        this.cache = cache;
        this.logger = new common_1.Logger(TenantContextMiddleware_1.name);
        this.l1Cache = new Map();
        this.L1_TTL_MS = 30_000;
        setInterval(() => this.evictL1(), 60_000);
    }
    async use(req, _res, next) {
        const path = req.path;
        if (BYPASS_PATHS.has(path) || path.endsWith('/health') || path.endsWith('/health/live')) {
            return next();
        }
        if (PUBLIC_PREFIXES.some(p => path.startsWith(p))) {
            return next();
        }
        const slug = req.headers['x-tenant-id'] ||
            this.extractFromHost(req.hostname) ||
            this.extractFromPath(path);
        const ctx = slug
            ? await this.resolveBySlug(slug)
            : await this.resolveByDomain(req.hostname);
        if (!ctx) {
            throw new common_1.UnauthorizedException(`Tenant not found: ${slug ?? req.hostname}`);
        }
        if (ctx.status === 'SUSPENDED') {
            throw new common_1.ForbiddenException('Tenant account is suspended');
        }
        req.tenantContext = ctx;
        this.prisma.$executeRaw `SELECT set_config('app.current_tenant_id', ${ctx.tenantId}, true)`
            .catch(err => this.logger.error(`RLS set_config failed: ${err.message}`));
        next();
    }
    async resolveBySlug(slug) {
        const l1 = this.l1Cache.get(`slug:${slug}`);
        if (l1 && l1.expiresAt > Date.now())
            return l1.ctx;
        const ctx = await this.cache.remember(`tenant:${slug}`, TENANT_SLUG_TTL, async () => {
            const t = await this.prisma.tenant.findUnique({
                where: { slug },
                select: { id: true, slug: true, tier: true, status: true, schemaName: true, planLimits: true, dataRegion: true },
            });
            if (!t)
                return null;
            return {
                tenantId: t.id, tenantSlug: t.slug, tier: t.tier, status: t.status,
                schemaName: t.schemaName, planLimits: t.planLimits, dataRegion: t.dataRegion,
            };
        });
        if (ctx)
            this.l1Cache.set(`slug:${slug}`, { ctx, expiresAt: Date.now() + this.L1_TTL_MS });
        return ctx;
    }
    async resolveByDomain(domain) {
        const l1 = this.l1Cache.get(`domain:${domain}`);
        if (l1 && l1.expiresAt > Date.now())
            return l1.ctx;
        const ctx = await this.cache.remember(`tenant-domain:${domain}`, TENANT_DOMAIN_TTL, async () => {
            const t = await this.prisma.tenant.findFirst({
                where: { customDomain: domain },
                select: { id: true, slug: true, tier: true, status: true, schemaName: true, planLimits: true, dataRegion: true },
            });
            if (!t)
                return null;
            return {
                tenantId: t.id, tenantSlug: t.slug, tier: t.tier, status: t.status,
                schemaName: t.schemaName, planLimits: t.planLimits, dataRegion: t.dataRegion,
            };
        });
        if (ctx)
            this.l1Cache.set(`domain:${domain}`, { ctx, expiresAt: Date.now() + this.L1_TTL_MS });
        return ctx;
    }
    extractFromHost(hostname) {
        const parts = hostname.split('.');
        return parts.length >= 3 ? parts[0] : null;
    }
    extractFromPath(path) {
        return path.match(/^\/api\/v1\/tenant\/([^/]+)/)?.[1] ?? null;
    }
    evictL1() {
        const now = Date.now();
        for (const [key, entry] of this.l1Cache) {
            if (entry.expiresAt <= now)
                this.l1Cache.delete(key);
        }
    }
};
exports.TenantContextMiddleware = TenantContextMiddleware;
exports.TenantContextMiddleware = TenantContextMiddleware = TenantContextMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cache_service_1.CacheService])
], TenantContextMiddleware);
//# sourceMappingURL=tenant-context.middleware.js.map