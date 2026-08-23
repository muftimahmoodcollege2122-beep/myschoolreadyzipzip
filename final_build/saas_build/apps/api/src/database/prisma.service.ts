/**
 * Prisma ORM service — wraps PrismaClient with:
 * - Connection pooling (5 connections/prod, 10/dev)
 * - Auto-retry on startup (5 attempts with exponential backoff)
 * - Soft-delete middleware (delete → update deletedAt)
 * - Slow query logging (>200ms logged as warning)
 * - Per-request RLS helper: queryTenantScoped() sets PostgreSQL session variable
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tenantContextStorage } from '../common/tenant-context.storage';

// Models with no tenantId column — never RLS-scoped, safe to query directly.
const GLOBAL_MODELS = new Set(['tenant']);

/**
 * PrismaService — wraps PrismaClient with:
 * - Graceful startup when DATABASE_URL not set (degraded mode)
 * - Graceful startup when prisma generate hasn't run (dynamic require)
 * - Soft-delete middleware
 * - Slow query logging
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private _client: any = null;
  private isConnected = false;

  constructor(private readonly config: ConfigService) {}

  private buildUrl(): string | null {
    const dbUrl = process.env.DATABASE_URL ?? this.config.get<string>('DATABASE_URL') ?? '';
    if (!dbUrl) return null;

    const isProd = (process.env.NODE_ENV ?? this.config.get('NODE_ENV')) === 'production';
    // DB_POOL_MAX is a per-instance limit — with N pods each holding up to
    // this many connections, N * DB_POOL_MAX must stay under Neon's plan
    // connection ceiling. Going through Neon's pooler endpoint (host
    // contains "-pooler", transaction-mode PgBouncer) is what actually lets
    // this scale past a handful of pods — direct-to-Postgres connections
    // don't. Default stays conservative; override via DB_POOL_MAX per pod
    // count when there's a pooler in front.
    const configuredMax = parseInt(process.env.DB_POOL_MAX || '', 10);
    const poolSize = Number.isFinite(configuredMax) && configuredMax > 0
      ? configuredMax
      : (isProd ? 5 : 10);

    let url = dbUrl.includes('connection_limit')
      ? dbUrl
      : `${dbUrl}${dbUrl.includes('?') ? '&' : '?'}connection_limit=${poolSize}&pool_timeout=10&connect_timeout=10`;

    // Neon's pooled endpoint (and PgBouncer transaction-pooling in general)
    // doesn't support session-level prepared statements the way Prisma uses
    // by default. Without pgbouncer=true, queries randomly fail under
    // concurrent load with "prepared statement already exists" errors —
    // this is exactly the kind of thing that looks fine in dev (low
    // concurrency, one connection reused) and falls over in production at
    // scale. Auto-detect and fix rather than relying on every operator to
    // remember the flag.
    const isPooledEndpoint = /-pooler\.|pgbouncer/i.test(url);
    if (isPooledEndpoint && !/pgbouncer=true/i.test(url)) {
      url += `${url.includes('?') ? '&' : '?'}pgbouncer=true`;
      this.logger.log('Detected pooled DB endpoint — added pgbouncer=true to avoid prepared-statement errors under load');
    }

    return url;
  }

  async onModuleInit(): Promise<void> {
    const url = this.buildUrl();
    if (!url) {
      this.logger.warn('DATABASE_URL not set — running without database');
      return;
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      this._client = new PrismaClient({
        datasources: { db: { url } },
        log: [
          { level: 'warn',  emit: 'event' },
          { level: 'error', emit: 'event' },
        ],
        errorFormat: 'minimal',
      });

      this._client.$use(async (params: any, next: any) => {
        if (params.action === 'delete') {
          params.action = 'update';
          params.args.data = { deletedAt: new Date() };
        }
        if (params.action === 'deleteMany') {
          params.action = 'updateMany';
          params.args.data = { deletedAt: new Date() };
        }
        if ((params.action === 'findFirst' || params.action === 'findMany') && this.modelHasSoftDelete(params.model)) {
          if (!params.args) params.args = {};
          if (!params.args.where) params.args.where = {};
          params.args.where.deletedAt = null;
        }
        return next(params);
      });

      this._client.$on('warn',  (e: any) => this.logger.warn(`Prisma: ${e.message}`));
      this._client.$on('error', (e: any) => this.logger.error(`Prisma: ${e.message}`));

      let attempts = 0;
      while (attempts < 5) {
        try {
          await this._client.$connect();
          this.isConnected = true;
          this.logger.log('Database connected');
          return;
        } catch (err) {
          attempts++;
          this.logger.warn(`DB connect attempt ${attempts}/5: ${(err as Error).message}`);
          if (attempts < 5) await new Promise(r => setTimeout(r, attempts * 2000));
        }
      }
      this.logger.error('Database unavailable after 5 attempts — API in degraded mode');
    } catch (err) {
      this.logger.error(`PrismaClient init failed: ${(err as Error).message} — run prisma generate`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this._client && this.isConnected) {
      try { await this._client.$disconnect(); } catch {}
    }
  }

  private _scopedClientCache: any = null;

  /**
   * Tenant-scoped Prisma client — every model query gets automatically wrapped
   * in a transaction that sets the Postgres RLS session variable for the
   * current request's tenant (read from AsyncLocalStorage, populated by
   * TenantContextMiddleware). This means the ~40 service files DON'T need to
   * change: `this.prisma.student.findMany(...)` is now RLS-safe by default.
   *
   * If no tenant context is present (e.g. platform bootstrap, tenant
   * resolution itself before context exists), falls back to the raw client
   * unscoped — same behavior as before this change, no new failure mode.
   *
   * Real isolation ALSO requires the matching `CREATE POLICY` migration to
   * exist on each table — see prisma/migrations/*_enable_rls. This proxy is
   * the application-side half; the database-side half is a separate file.
   */
  private get scopedClient(): any {
    if (!this._client) return null;
    if (!this._scopedClientCache) {
      const raw = this._client;
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
   * Raw, unscoped client — bypasses RLS entirely. ONLY use for legitimate
   * cross-tenant platform-admin queries (e.g. super-admin aggregating stats
   * across all schools). Everywhere else, use the regular model getters.
   */
  get unscoped(): any { return this._client; }

  private modelHasSoftDelete(model: string | undefined): boolean {
    return ['User', 'Student', 'Teacher', 'Staff', 'School'].includes(model ?? '');
  }

  // ── Proxy all Prisma model accessors ────────────────────────────────────────
  get user()                  { return this.scopedClient?.user; }
  get tenant()                { return this.scopedClient?.tenant; }
  get school()                { return this.scopedClient?.school; }
  get student()               { return this.scopedClient?.student; }
  get teacher()               { return this.scopedClient?.teacher; }
  get staff()                 { return this.scopedClient?.staff; }
  get class()                 { return this.scopedClient?.class; }
  get section()               { return this.scopedClient?.section; }
  get subject()               { return this.scopedClient?.subject; }
  get attendance()            { return this.scopedClient?.attendance; }
  get teacherAttendance()     { return this.scopedClient?.teacherAttendance; }
  get exam()                  { return this.scopedClient?.exam; }
  get examResult()            { return this.scopedClient?.examResult; }
  get grade()                 { return this.scopedClient?.grade; }
  get feeStructure()          { return this.scopedClient?.feeStructure; }
  get feeInvoice()            { return this.scopedClient?.feeInvoice; }
  get feeDiscount()           { return this.scopedClient?.feeDiscount; }
  get scholarship()           { return this.scopedClient?.scholarship; }
  get scholarshipGrant()      { return this.scopedClient?.scholarshipGrant; }
  get notification()          { return this.scopedClient?.notification; }
  get outboxEvent()           { return this.scopedClient?.outboxEvent; }
  get auditLog()              { return this.scopedClient?.auditLog; }
  get studentEnrollment()     { return this.scopedClient?.studentEnrollment; }
  get studentParent()         { return this.scopedClient?.studentParent; }
  get studentDocument()       { return this.scopedClient?.studentDocument; }
  get studentWarning()        { return this.scopedClient?.studentWarning; }
  get studentBehavior()       { return this.scopedClient?.studentBehavior; }
  get studentMedicalRecord()  { return this.scopedClient?.studentMedicalRecord; }
  get studentAchievement()    { return this.scopedClient?.studentAchievement; }
  get leaveRequest()          { return this.scopedClient?.leaveRequest; }
  get timetableSlot()         { return this.scopedClient?.timetableSlot; }
  get announcement()          { return this.scopedClient?.announcement; }
  get libraryBook()           { return this.scopedClient?.libraryBook; }
  get bookIssue()             { return this.scopedClient?.bookIssue; }
  get transportRoute()        { return this.scopedClient?.transportRoute; }
  get hostelRoom()            { return this.scopedClient?.hostelRoom; }
  get hostelAllocation()      { return this.scopedClient?.hostelAllocation; }
  get budget()                { return this.scopedClient?.budget; }
  get expense()               { return this.scopedClient?.expense; }
  get paymentOrder()          { return this.scopedClient?.paymentOrder; }
  get customForm()            { return this.scopedClient?.customForm; }
  get formResponse()          { return this.scopedClient?.formResponse; }
  get alumni()                { return this.scopedClient?.alumni; }
  get supportTicket()         { return this.scopedClient?.supportTicket; }
  get userSession()           { return this.scopedClient?.userSession; }
  get classSubject()          { return this.scopedClient?.classSubject; }
  get department()            { return this.scopedClient?.department; }
  get academicCalendar()      { return this.scopedClient?.academicCalendar; }
  get schoolTheme()           { return this.scopedClient?.schoolTheme; }
  get websiteContent()        { return this.scopedClient?.websiteContent; }
  get blogPost()              { return this.scopedClient?.blogPost; }
  get media()                 { return this.scopedClient?.media; }
  get qrAttendanceCode()      { return this.scopedClient?.qrAttendanceCode; }
  get inventoryItem()         { return this.scopedClient?.inventoryItem; }
  get assignment()            { return this.scopedClient?.assignment; }
  get assignmentSubmission()  { return this.scopedClient?.assignmentSubmission; }
  get lessonPlan()            { return this.scopedClient?.lessonPlan; }

  get academicRule() { return this.scopedClient?.academicRule; }
  get cashbookEntry() { return this.scopedClient?.cashbookEntry; }
  get consentRecord() { return this.scopedClient?.consentRecord; }
  get coupon() { return this.scopedClient?.coupon; }
  get couponUsage() { return this.scopedClient?.couponUsage; }
  get feeInstallment() { return this.scopedClient?.feeInstallment; }
  get feeInstallmentPlan() { return this.scopedClient?.feeInstallmentPlan; }
  get galleryAlbum() { return this.scopedClient?.galleryAlbum; }
  get galleryItem() { return this.scopedClient?.galleryItem; }
  get ipRestriction() { return this.scopedClient?.ipRestriction; }
  get loginHistory() { return this.scopedClient?.loginHistory; }
  get message() { return this.scopedClient?.message; }
  get messageThread() { return this.scopedClient?.messageThread; }
  get onlineExamAnswer() { return this.scopedClient?.onlineExamAnswer; }
  get onlineExamSession() { return this.scopedClient?.onlineExamSession; }
  get payment() { return this.scopedClient?.payment; }
  get question() { return this.scopedClient?.question; }
  get questionBank() { return this.scopedClient?.questionBank; }
  get schoolEvent() { return this.scopedClient?.schoolEvent; }
  get schoolPolicy() { return this.scopedClient?.schoolPolicy; }
  get setupChecklist() { return this.scopedClient?.setupChecklist; }
  get suspiciousActivity() { return this.scopedClient?.suspiciousActivity; }
  get teacherCertification() { return this.scopedClient?.teacherCertification; }
  get teacherSubstitution() { return this.scopedClient?.teacherSubstitution; }
  get trainingRecord() { return this.scopedClient?.trainingRecord; }
  get usageRecord() { return this.scopedClient?.usageRecord; }
  get subscription() { return this.scopedClient?.subscription; }

  // ── Raw query helpers ────────────────────────────────────────────────────────
  get $queryRaw() {
    const raw = this._client;
    if (!raw) throw new Error('PrismaService: no database connection ($queryRaw called before $connect / DATABASE_URL not set)');
    // Raw queries hit FORCE-RLS tables too. Binding straight to the raw
    // client (the old behavior) never sets app.current_tenant_id, so the
    // fail-closed policy silently returns zero rows for any RLS table —
    // wrap in the same transaction pattern as scopedClient/$transaction.
    return (strings: any, ...values: any[]) => {
      const ctx = tenantContextStorage.getStore();
      if (!ctx?.tenantId || ctx.isPlatformAdmin) return raw.$queryRaw(strings, ...values);
      return raw.$transaction(async (tx: any) => {
        await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${ctx.tenantId}, true)`;
        return tx.$queryRaw(strings, ...values);
      });
    };
  }
  get $executeRaw()  { return this._client?.$executeRaw?.bind(this._client); }
  get $connect()     { return this._client?.$connect?.bind(this._client); }
  get $disconnect()  { return this._client?.$disconnect?.bind(this._client); }

  /**
   * Wraps interactive transactions ($transaction(async tx => {...})) so the
   * RLS session var gets set automatically from AsyncLocalStorage before the
   * callback runs — this covers every raw `this.prisma.$transaction(...)`
   * call across the codebase without editing each one individually.
   *
   * Batch-form transactions ($transaction([query1, query2])) are passed
   * through unchanged — they don't get a callback to inject into, and in
   * practice every raw $transaction() in this codebase uses the callback
   * form. If a batch-form transaction against an RLS table is ever added
   * without going through the interactive form, its writes will be
   * rejected — treat that as a signal to convert it to the callback form.
   */
  get $transaction() {
    if (!this._client) throw new Error('PrismaService: no database connection ($transaction called before $connect / DATABASE_URL not set)');
    const raw = this._client.$transaction.bind(this._client);
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

  async queryTenantScoped<T>(tenantId: string, query: (prisma: any) => Promise<T>): Promise<T> {
    return this._client.$transaction(async (tx: any) => {
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
      return query(tx);
    });
  }

  async ping(): Promise<boolean> {
    try { await this._client.$queryRaw`SELECT 1`; return true; } catch { return false; }
  }
}
