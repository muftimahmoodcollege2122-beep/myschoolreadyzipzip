/**
 * Tenant resolution middleware — runs on EVERY request.
 * Resolves the school tenant from: x-tenant-id header → subdomain → custom domain.
 * Uses L1 in-memory cache (30s) + L2 Redis cache (10min) to avoid DB hits on every request.
 * Attaches tenantContext to req object and sets PostgreSQL RLS variable.
 * Critical for multi-tenancy — without this, all module queries would return data across all schools.
 */

import { Injectable, NestMiddleware, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../cache/cache.service';
import { tenantContextStorage } from '../tenant-context.storage';

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  tier: string;
  status: string;
  schemaName: string;
  planLimits: Record<string, unknown>;
  dataRegion: string;
}

declare global {
  namespace Express {
    interface Request { tenantContext?: TenantContext; }
  }
}

const BYPASS_PATHS = new Set(['/health', '/health/live', '/health/ready', '/metrics']);
const PUBLIC_PREFIXES = ['/api/v1/public/', '/api/v1/webhooks/', '/api/v1/auth/'];

// Individual @Public() routes on ThemesController that take the tenant slug/domain
// directly as a path param and resolve their own tenant record inside the service —
// they don't need (and shouldn't require) TenantContextMiddleware's tenant context.
// @Public() only bypasses the JWT guard; it has no effect on this Express middleware,
// which runs earlier in the pipeline, so these must be listed explicitly or every
// request to them — including this app's own server-side theme fetches — 401s.
const PUBLIC_PATH_PATTERNS: RegExp[] = [
  /^\/api\/v1\/themes\/school\/[^/]+$/,
  /^\/api\/v1\/themes\/by-domain\/[^/]+$/,
  /^\/api\/v1\/themes\/presets$/,
  /^\/api\/v1\/themes\/portal-settings\/slug\/[^/]+$/,
  /^\/api\/v1\/themes\/nav-config\/slug\/[^/]+$/,
  /^\/api\/v1\/themes\/portal-branding\/slug\/[^/]+$/,
  /^\/api\/v1\/themes\/alert-banners\/slug\/[^/]+$/,
  /^\/api\/v1\/themes\/pages\/slug\/[^/]+$/,
  /^\/api\/v1\/themes\/dashboard-widgets\/slug\/[^/]+$/,
  /^\/api\/v1\/themes\/labels\/slug\/[^/]+$/,
];

// Cache TTLs — longer = fewer DB hits = better throughput at 100k schools
const TENANT_SLUG_TTL  = 600;  // 10 min — slugs never change
const TENANT_DOMAIN_TTL = 300; // 5 min — custom domains rarely change

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantContextMiddleware.name);
  // In-process memory cache as L1 before Redis — eliminates Redis round trip for hot tenants
  private readonly l1Cache = new Map<string, { ctx: TenantContext; expiresAt: number }>();
  private readonly L1_TTL_MS = 30_000; // 30 seconds

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {
    // Evict expired L1 entries every 60s
    setInterval(() => this.evictL1(), 60_000);
  }

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const path = req.path;

    if (BYPASS_PATHS.has(path) || path.endsWith('/health') || path.endsWith('/health/live')) {
      return next();
    }
    if (PUBLIC_PREFIXES.some(p => path.startsWith(p))) {
      return next();
    }
    if (PUBLIC_PATH_PATTERNS.some(re => re.test(path))) {
      return next();
    }

    const slug =
      (req.headers['x-tenant-id'] as string) ||
      this.extractFromHost(req.hostname) ||
      this.extractFromPath(path);

    const ctx = slug
      ? await this.resolveBySlug(slug)
      : await this.resolveByDomain(req.hostname);

    if (!ctx) {
      throw new UnauthorizedException(`Tenant not found: ${slug ?? req.hostname}`);
    }
    if (ctx.status === 'SUSPENDED') {
      throw new ForbiddenException('Tenant account is suspended');
    }

    req.tenantContext = ctx;

    // Real RLS propagation — every Prisma query made anywhere during this
    // request's async chain (via PrismaService's scopedClient) reads this
    // from AsyncLocalStorage and sets the Postgres session var itself,
    // inside its own transaction, on whichever connection it actually runs
    // on. This replaced a fire-and-forget set_config() call that ran on a
    // throwaway connection and never reliably reached the query that
    // followed it — see git history if you need the old (broken) version.
    tenantContextStorage.run({ tenantId: ctx.tenantId }, () => next());
  }

  private async resolveBySlug(slug: string): Promise<TenantContext | null> {
    // L1 check
    const l1 = this.l1Cache.get(`slug:${slug}`);
    if (l1 && l1.expiresAt > Date.now()) return l1.ctx;

    // L2 (Redis) check
    const ctx = await this.cache.remember<TenantContext | null>(
      `tenant:${slug}`,
      TENANT_SLUG_TTL,
      async () => {
        const t = await this.prisma.tenant.findUnique({
          where: { slug },
          select: { id: true, slug: true, tier: true, status: true, schemaName: true, planLimits: true, dataRegion: true },
        });
        if (!t) return null;
        return {
          tenantId: t.id, tenantSlug: t.slug, tier: t.tier, status: t.status,
          schemaName: t.schemaName, planLimits: t.planLimits as Record<string, unknown>, dataRegion: t.dataRegion,
        };
      },
    );

    if (ctx) this.l1Cache.set(`slug:${slug}`, { ctx, expiresAt: Date.now() + this.L1_TTL_MS });
    return ctx;
  }

  private async resolveByDomain(domain: string): Promise<TenantContext | null> {
    const l1 = this.l1Cache.get(`domain:${domain}`);
    if (l1 && l1.expiresAt > Date.now()) return l1.ctx;

    const ctx = await this.cache.remember<TenantContext | null>(
      `tenant-domain:${domain}`,
      TENANT_DOMAIN_TTL,
      async () => {
        const t = await this.prisma.tenant.findFirst({
          where: { customDomain: domain },
          select: { id: true, slug: true, tier: true, status: true, schemaName: true, planLimits: true, dataRegion: true },
        });
        if (!t) return null;
        return {
          tenantId: t.id, tenantSlug: t.slug, tier: t.tier, status: t.status,
          schemaName: t.schemaName, planLimits: t.planLimits as Record<string, unknown>, dataRegion: t.dataRegion,
        };
      },
    );

    if (ctx) this.l1Cache.set(`domain:${domain}`, { ctx, expiresAt: Date.now() + this.L1_TTL_MS });
    return ctx;
  }

  private extractFromHost(hostname: string): string | null {
    const parts = hostname.split('.');
    return parts.length >= 3 ? parts[0] : null;
  }

  private extractFromPath(path: string): string | null {
    return path.match(/^\/api\/v1\/tenant\/([^/]+)/)?.[1] ?? null;
  }

  private evictL1(): void {
    const now = Date.now();
    for (const [key, entry] of this.l1Cache) {
      if (entry.expiresAt <= now) this.l1Cache.delete(key);
    }
  }
}
