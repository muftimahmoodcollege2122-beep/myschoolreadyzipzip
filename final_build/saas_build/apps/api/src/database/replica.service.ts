import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

/**
 * Read replica client — routes heavy read queries (reports, analytics, exports)
 * away from the primary DB to a read replica.
 *
 * Falls back to primary if no replica is configured (safe in dev).
 */
@Injectable()
export class ReplicaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReplicaService.name);
  private isReplica = false;

  constructor(private readonly config: ConfigService) {
    const replicaUrl = config.get<string>('DATABASE_REPLICA_URL');
    const primaryUrl = config.get<string>('DATABASE_URL') ?? '';

    // Use replica URL if available, else fall back to primary
    const url = replicaUrl ?? primaryUrl;
    const isReplica = !!replicaUrl;

    const poolSize = 3; // replicas are read-only, smaller pool is fine
    const finalUrl = url.includes('connection_limit')
      ? url
      : `${url}${url.includes('?') ? '&' : '?'}connection_limit=${poolSize}&pool_timeout=5`;

    super({ datasources: { db: { url: finalUrl } }, errorFormat: 'minimal' });
    this.isReplica = isReplica;
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log(this.isReplica ? 'Read replica connected' : 'Read replica using primary (no replica configured)');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
