import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;

  constructor(private readonly config: ConfigService) {
    const dbUrl = process.env.DATABASE_URL ?? config.get<string>('DATABASE_URL') ?? '';
    const isProd = (process.env.NODE_ENV ?? config.get('NODE_ENV')) === 'production';
    const poolSize = isProd ? 5 : 10;

    // Always call super — use dummy URL if DATABASE_URL not set (degraded mode)
    const effectiveUrl = dbUrl
      ? (dbUrl.includes('connection_limit')
          ? dbUrl
          : `${dbUrl}${dbUrl.includes('?') ? '&' : '?'}connection_limit=${poolSize}&pool_timeout=10&connect_timeout=10`)
      : 'postgresql://localhost:5432/noop?connection_limit=1';

    super({
      datasources: { db: { url: effectiveUrl } },
      log: [
        { level: 'warn',  emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
      errorFormat: 'minimal',
    });

    if (dbUrl) {
      this.setupMiddleware();
      this.setupLogging();
    }
  }

  async onModuleInit(): Promise<void> {
    const dbUrl = process.env.DATABASE_URL ?? '';
    if (!dbUrl) {
      this.logger.warn('DATABASE_URL not set — running without database. Set DATABASE_URL to enable full functionality.');
      return;
    }

    let attempts = 0;
    while (attempts < 5) {
      try {
        await this.$connect();
        this.isConnected = true;
        this.logger.log('Database connected');
        return;
      } catch (err) {
        attempts++;
        this.logger.warn(`DB connect attempt ${attempts}/5 failed: ${(err as Error).message}`);
        if (attempts < 5) await new Promise(r => setTimeout(r, attempts * 2000));
      }
    }
    // Log warning but DON'T throw — let the app start so health endpoint can respond
    this.logger.error('Failed to connect to database after 5 attempts — API starting in degraded mode');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.isConnected) {
      await this.$disconnect();
      this.logger.log('Database disconnected');
    }
  }

  private setupMiddleware(): void {
    this.$use(async (params: any, next) => {
      if (params.action === 'delete') {
        params.action = 'update';
        params.args.data = { deletedAt: new Date() };
      }
      if (params.action === 'deleteMany') {
        params.action = 'updateMany';
        params.args.data = { deletedAt: new Date() };
      }
      if (params.action === 'findFirst' || params.action === 'findMany') {
        if (!params.args) params.args = {};
        if (!params.args.where) params.args.where = {};
        if (this.modelHasSoftDelete(params.model)) {
          params.args.where.deletedAt = null;
        }
      }
      return next(params);
    });
  }

  private setupLogging(): void {
    (this as any).$on('warn',  (e: { message: string }) => this.logger.warn(`Prisma: ${e.message}`));
    (this as any).$on('error', (e: { message: string }) => this.logger.error(`Prisma: ${e.message}`));
  }

  private modelHasSoftDelete(model: string | undefined): boolean {
    return ['User', 'Student', 'Teacher', 'Staff', 'School'].includes(model ?? '');
  }

  async queryTenantScoped<T>(tenantId: string, query: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
      return query(tx as unknown as PrismaClient);
    });
  }

  async ping(): Promise<boolean> {
    try { await this.$queryRaw`SELECT 1`; return true; } catch { return false; }
  }
}
