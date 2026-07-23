/**
 * Read replica Prisma client — routes heavy read queries (reports, analytics, exports)
 * to a read replica to take load off the primary DB.
 * Falls back to primary DB if DATABASE_REPLICA_URL is not set (safe in dev).
 * Used by: DashboardService, ReportsService, AiAnalyticsService.
 *
 * IMPORTANT: RLS-protected tables use FORCE ROW LEVEL SECURITY with a
 * fail-closed policy (`current_setting('app.current_tenant_id', true)`
 * returns NULL, matching nothing, when the session var isn't set). This
 * client mirrors PrismaService's scopedClient so every model query on a
 * replica connection also sets that session var from the same
 * AsyncLocalStorage context — otherwise every RLS-protected query here
 * silently returns zero rows instead of throwing.
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tenantContextStorage } from '../common/tenant-context.storage';

// Mirrors PrismaService.GLOBAL_MODELS — models with no tenantId column.
const GLOBAL_MODELS = new Set(['tenant']);

@Injectable()
export class ReplicaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReplicaService.name);
  private client: any = null;
  private isReplica = false;
  private _scopedClientCache: any = null;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const replicaUrl = process.env.DATABASE_READ_URL || process.env.DATABASE_REPLICA_URL;
    const primaryUrl = process.env.DATABASE_URL;
    const url = replicaUrl ?? primaryUrl;

    if (!url) {
      this.logger.warn('No DATABASE_URL — ReplicaService running in stub mode');
      return;
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const configuredMax = parseInt(process.env.DB_REPLICA_POOL_MAX || '', 10);
      const poolSize = Number.isFinite(configuredMax) && configuredMax > 0 ? configuredMax : 3;
      let finalUrl = url.includes('connection_limit')
        ? url
        : `${url}${url.includes('?') ? '&' : '?'}connection_limit=${poolSize}&pool_timeout=5`;

      const isPooledEndpoint = /-pooler\.|pgbouncer/i.test(finalUrl);
      if (isPooledEndpoint && !/pgbouncer=true/i.test(finalUrl)) {
        finalUrl += `${finalUrl.includes('?') ? '&' : '?'}pgbouncer=true`;
      }

      this.client = new PrismaClient({
        datasources: { db: { url: finalUrl } },
        errorFormat: 'minimal',
      });

      await this.client.$connect();
      this.isReplica = !!replicaUrl;
      this.logger.log(this.isReplica
        ? 'Read replica connected'
        : 'Read replica using primary (no replica configured)');
    } catch (err) {
      this.logger.warn(`ReplicaService connection failed: ${(err as Error).message} — using stub`);
      this.client = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      try { await this.client.$disconnect(); } catch {}
    }
  }

  /**
   * Tenant-scoped client — every model query wraps in a transaction that
   * sets the Postgres RLS session var from the current request's
   * AsyncLocalStorage context, same as PrismaService.scopedClient.
   * If no tenant context is present and it's not an explicit platform-admin
   * query, falls back to the raw client (matches PrismaService behavior —
   * FORCE RLS will then correctly return zero rows rather than leaking).
   */
  private get scopedClient(): any {
    if (!this.client) return null;
    if (!this._scopedClientCache) {
      const raw = this.client;
      this._scopedClientCache = new Proxy(raw, {
        get: (target, modelName: string) => {
          const delegate = target[modelName];
          if (!delegate || typeof delegate !== 'object' || GLOBAL_MODELS.has(modelName)) return delegate;
          return new Proxy(delegate, {
            get: (delegateTarget, method: string) => {
              const fn = delegateTarget[method];
              if (typeof fn !== 'function') return fn;
              return (...args: any[]) => {
                const ctx = tenantContextStorage.getStore();
                if (!ctx?.tenantId || ctx.isPlatformAdmin) return fn.apply(delegateTarget, args);
                return raw.$transaction(async (tx: any) => {
                  await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${ctx.tenantId}, true)`;
                  return tx[modelName][method](...args);
                });
              };
            },
          });
        },
      });
    }
    return this._scopedClientCache;
  }

  /**
   * Raw, unscoped client — bypasses RLS. ONLY for legitimate cross-tenant
   * platform-admin aggregates (e.g. getPlatformStats()). Everywhere else
   * use the regular model getters below.
   */
  get unscoped(): any { return this.client; }

  get $queryRaw() {
    const raw = this.client;
    if (!raw) return undefined;
    return (strings: any, ...values: any[]) => {
      const ctx = tenantContextStorage.getStore();
      if (!ctx?.tenantId || ctx.isPlatformAdmin) return raw.$queryRaw(strings, ...values);
      return raw.$transaction(async (tx: any) => {
        await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${ctx.tenantId}, true)`;
        return tx.$queryRaw(strings, ...values);
      });
    };
  }
  get $transaction() {
    if (!this.client) return undefined;
    const raw = this.client.$transaction.bind(this.client);
    return (arg: any, options?: any) => {
      if (typeof arg !== 'function') return raw(arg, options);
      return raw(async (tx: any) => {
        const ctx = tenantContextStorage.getStore();
        if (ctx?.tenantId && !ctx.isPlatformAdmin) {
          await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${ctx.tenantId}, true)`;
        }
        return arg(tx);
      }, options);
    };
  }

  // Generic model accessor — used by analytics/reports services
  model(name: string) { return this.scopedClient?.[name]; }

  isAvailable() { return this.client !== null; }

  // Model proxies — same interface as PrismaService for services that use replica
  get student()      { return this.scopedClient?.student; }
  get teacher()       { return this.scopedClient?.teacher; }
  get exam()          { return this.scopedClient?.exam; }
  get feeInvoice()    { return this.scopedClient?.feeInvoice; }
  get notification()  { return this.scopedClient?.notification; }
  get attendance()    { return this.scopedClient?.attendance; }
  get tenant()         { return this.scopedClient?.tenant; }
  get auditLog()       { return this.scopedClient?.auditLog; }
  get user()            { return this.scopedClient?.user; }
  get teacherAttendance() { return this.scopedClient?.teacherAttendance; }
  get lessonPlan()        { return this.scopedClient?.lessonPlan; }
  get examResult()        { return this.scopedClient?.examResult; }
  get grade()              { return this.scopedClient?.grade; }
}
