import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Read replica client — routes heavy read queries away from primary DB.
 * Falls back to primary if no replica configured.
 * Safe-starts even when DATABASE_URL is not set (degraded mode).
 */
@Injectable()
export class ReplicaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReplicaService.name);
  private client: any = null;
  private isReplica = false;

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
      const poolSize = 3;
      const finalUrl = url.includes('connection_limit')
        ? url
        : `${url}${url.includes('?') ? '&' : '?'}connection_limit=${poolSize}&pool_timeout=5`;

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

  // Proxy all prisma calls to the client, falling back to null safely
  get $queryRaw() { return this.client?.$queryRaw?.bind(this.client); }
  get $transaction() { return this.client?.$transaction?.bind(this.client); }

  // Generic model accessor — used by analytics/reports services
  model(name: string) { return this.client?.[name]; }

  isAvailable() { return this.client !== null; }
  // Model proxies — same interface as PrismaService for services that use replica
  get student()      { return this.client?.student; }
  get teacher()      { return this.client?.teacher; }
  get exam()         { return this.client?.exam; }
  get feeInvoice()   { return this.client?.feeInvoice; }
  get notification() { return this.client?.notification; }
  get attendance()   { return this.client?.attendance; }
  get tenant()       { return this.client?.tenant; }
  get auditLog()     { return this.client?.auditLog; }
  get user()         { return this.client?.user; }
}
