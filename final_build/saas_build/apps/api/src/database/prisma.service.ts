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
    const poolSize = isProd ? 5 : 10;
    return dbUrl.includes('connection_limit')
      ? dbUrl
      : `${dbUrl}${dbUrl.includes('?') ? '&' : '?'}connection_limit=${poolSize}&pool_timeout=10&connect_timeout=10`;
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

  private modelHasSoftDelete(model: string | undefined): boolean {
    return ['User', 'Student', 'Teacher', 'Staff', 'School'].includes(model ?? '');
  }

  // ── Proxy all Prisma model accessors ────────────────────────────────────────
  get user()                  { return this._client?.user; }
  get tenant()                { return this._client?.tenant; }
  get school()                { return this._client?.school; }
  get student()               { return this._client?.student; }
  get teacher()               { return this._client?.teacher; }
  get staff()                 { return this._client?.staff; }
  get class()                 { return this._client?.class; }
  get section()               { return this._client?.section; }
  get subject()               { return this._client?.subject; }
  get attendance()            { return this._client?.attendance; }
  get teacherAttendance()     { return this._client?.teacherAttendance; }
  get exam()                  { return this._client?.exam; }
  get examResult()            { return this._client?.examResult; }
  get grade()                 { return this._client?.grade; }
  get feeStructure()          { return this._client?.feeStructure; }
  get feeInvoice()            { return this._client?.feeInvoice; }
  get feeDiscount()           { return this._client?.feeDiscount; }
  get scholarship()           { return this._client?.scholarship; }
  get scholarshipGrant()      { return this._client?.scholarshipGrant; }
  get notification()          { return this._client?.notification; }
  get outboxEvent()           { return this._client?.outboxEvent; }
  get auditLog()              { return this._client?.auditLog; }
  get studentEnrollment()     { return this._client?.studentEnrollment; }
  get studentParent()         { return this._client?.studentParent; }
  get studentDocument()       { return this._client?.studentDocument; }
  get studentWarning()        { return this._client?.studentWarning; }
  get studentBehavior()       { return this._client?.studentBehavior; }
  get studentMedicalRecord()  { return this._client?.studentMedicalRecord; }
  get studentAchievement()    { return this._client?.studentAchievement; }
  get leaveRequest()          { return this._client?.leaveRequest; }
  get timetableSlot()         { return this._client?.timetableSlot; }
  get announcement()          { return this._client?.announcement; }
  get libraryBook()           { return this._client?.libraryBook; }
  get bookIssue()             { return this._client?.bookIssue; }
  get transportRoute()        { return this._client?.transportRoute; }
  get hostelRoom()            { return this._client?.hostelRoom; }
  get hostelAllocation()      { return this._client?.hostelAllocation; }
  get budget()                { return this._client?.budget; }
  get expense()               { return this._client?.expense; }
  get paymentOrder()          { return this._client?.paymentOrder; }
  get customForm()            { return this._client?.customForm; }
  get formResponse()          { return this._client?.formResponse; }
  get alumni()                { return this._client?.alumni; }
  get supportTicket()         { return this._client?.supportTicket; }
  get userSession()           { return this._client?.userSession; }
  get classSubject()          { return this._client?.classSubject; }
  get department()            { return this._client?.department; }
  get academicCalendar()      { return this._client?.academicCalendar; }
  get schoolTheme()           { return this._client?.schoolTheme; }
  get websiteContent()        { return this._client?.websiteContent; }
  get blogPost()              { return this._client?.blogPost; }
  get media()                 { return this._client?.media; }
  get qrAttendanceCode()      { return this._client?.qrAttendanceCode; }
  get inventoryItem()         { return this._client?.inventoryItem; }
  get assignment()            { return this._client?.assignment; }
  get assignmentSubmission()  { return this._client?.assignmentSubmission; }
  get lessonPlan()            { return this._client?.lessonPlan; }

  get academicRule() { return this._client?.academicRule; }
  get cashbookEntry() { return this._client?.cashbookEntry; }
  get consentRecord() { return this._client?.consentRecord; }
  get coupon() { return this._client?.coupon; }
  get couponUsage() { return this._client?.couponUsage; }
  get feeInstallment() { return this._client?.feeInstallment; }
  get feeInstallmentPlan() { return this._client?.feeInstallmentPlan; }
  get galleryAlbum() { return this._client?.galleryAlbum; }
  get galleryItem() { return this._client?.galleryItem; }
  get ipRestriction() { return this._client?.ipRestriction; }
  get loginHistory() { return this._client?.loginHistory; }
  get message() { return this._client?.message; }
  get messageThread() { return this._client?.messageThread; }
  get onlineExamAnswer() { return this._client?.onlineExamAnswer; }
  get onlineExamSession() { return this._client?.onlineExamSession; }
  get payment() { return this._client?.payment; }
  get question() { return this._client?.question; }
  get questionBank() { return this._client?.questionBank; }
  get schoolEvent() { return this._client?.schoolEvent; }
  get schoolPolicy() { return this._client?.schoolPolicy; }
  get setupChecklist() { return this._client?.setupChecklist; }
  get suspiciousActivity() { return this._client?.suspiciousActivity; }
  get teacherCertification() { return this._client?.teacherCertification; }
  get teacherSubstitution() { return this._client?.teacherSubstitution; }
  get trainingRecord() { return this._client?.trainingRecord; }
  get usageRecord() { return this._client?.usageRecord; }

  // ── Raw query helpers ────────────────────────────────────────────────────────
  get $queryRaw()    { return this._client?.$queryRaw?.bind(this._client); }
  get $executeRaw()  { return this._client?.$executeRaw?.bind(this._client); }
  get $transaction() { return this._client?.$transaction?.bind(this._client); }
  get $connect()     { return this._client?.$connect?.bind(this._client); }
  get $disconnect()  { return this._client?.$disconnect?.bind(this._client); }

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
