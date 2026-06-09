import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../cache/cache.service';

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  tier: string;
  schemaName: string;
  planLimits: Record<string, unknown>;
  dataRegion: string;
}

declare global {
  namespace Express {
    interface Request {
      tenantContext?: TenantContext;
    }
  }
}

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantContextMiddleware.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Health checks bypass tenant resolution
    if (req.path === '/health' || req.path === '/health/live' || req.path === '/health/ready' ||
        req.path.endsWith('/health') || req.path.endsWith('/health/live') || req.path.endsWith('/health/ready')) {
      return next();
    }

    // Public routes (onboarding, stripe webhooks, auth)
    if (req.path.startsWith('/api/v1/public/') || req.path.startsWith('/api/v1/webhooks/') || req.path.startsWith('/api/v1/auth/')) {
      return next();
    }

    const headerSlug = req.headers['x-tenant-id'] as string;
    const subdomainSlug = this.extractTenantFromHost(req.hostname);
    const pathSlug = this.extractTenantFromPath(req.path);
    const tenantSlug = headerSlug || subdomainSlug || pathSlug;

    let tenantContext: TenantContext | null = null;

    // If no slug found, try resolving by custom domain
    if (!tenantSlug) {
      tenantContext = await this.resolveTenantByDomain(req.hostname);
      if (!tenantContext) {
        throw new UnauthorizedException('Tenant identifier required');
      }
    } else {
      tenantContext = await this.resolveTenant(tenantSlug);
      // Fallback: if slug lookup fails, try custom domain
      if (!tenantContext) {
        tenantContext = await this.resolveTenantByDomain(req.hostname);
      }
    }

    if (!tenantContext) {
      throw new UnauthorizedException(`Tenant not found: ${tenantSlug || req.hostname}`);
    }

    if (tenantContext.tier === 'SUSPENDED') {
      throw new ForbiddenException('Tenant account is suspended');
    }

    // Attach to request for downstream use
    req.tenantContext = tenantContext;

    // Set PostgreSQL session variable for RLS enforcement
    // This is belt-and-suspenders — Prisma middleware also scopes queries
    await this.prisma.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantContext.tenantId}, true)`;

    next();
  }

  private async resolveTenantByDomain(domain: string): Promise<TenantContext | null> {
    const cacheKey = `tenant-domain:${domain}`;
    const cached = await this.cache.get<TenantContext>(cacheKey);
    if (cached) return cached;

    const tenant = await this.prisma.tenant.findFirst({
      where: { customDomain: domain },
      select: { id: true, slug: true, tier: true, status: true, schemaName: true, planLimits: true, dataRegion: true },
    });

    if (!tenant) return null;
    const context: TenantContext = {
      tenantId: tenant.id, tenantSlug: tenant.slug, tier: tenant.tier,
      schemaName: tenant.schemaName, planLimits: tenant.planLimits as Record<string, unknown>, dataRegion: tenant.dataRegion,
    };
    await this.cache.set(cacheKey, context, 300);
    return context;
  }

  private async resolveTenant(slug: string): Promise<TenantContext | null> {
    const cacheKey = `tenant:${slug}`;

    // Cache tenant for 5 minutes — avoids DB hit on every request
    const cached = await this.cache.get<TenantContext>(cacheKey);
    if (cached) return cached;

    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        tier: true,
        status: true,
        schemaName: true,
        planLimits: true,
        dataRegion: true,
      },
    });

    if (!tenant) return null;

    const context: TenantContext = {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tier: tenant.tier,
      schemaName: tenant.schemaName,
      planLimits: tenant.planLimits as Record<string, unknown>,
      dataRegion: tenant.dataRegion,
    };

    await this.cache.set(cacheKey, context, 300); // 5 min TTL
    return context;
  }

  private extractTenantFromHost(hostname: string): string | null {
    // subdomain strategy: school-slug.schoolsaas.com
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      return parts[0]; // subdomain is tenant slug
    }
    return null;
  }

  private extractTenantFromPath(path: string): string | null {
    // Path strategy (fallback): /api/v1/tenant/school-slug/...
    const match = path.match(/^\/api\/v1\/tenant\/([^/]+)/);
    return match ? match[1] : null;
  }
}
