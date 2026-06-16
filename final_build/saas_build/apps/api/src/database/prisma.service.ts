import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly config: ConfigService) {
    const dbUrl = config.get<string>('DATABASE_URL') ?? '';

    // Connection pool: use PgBouncer in production, direct pool in dev
    // PgBouncer handles the heavy lifting at 100k schools — app just needs small pool
    const isProd = config.get('NODE_ENV') === 'production';
    const poolSize = isProd ? 5 : 10; // PgBouncer multiplies this per pod

    // Append pool config to DATABASE_URL if not already present
    const url = dbUrl.includes('connection_limit')
      ? dbUrl
      : `${dbUrl}${dbUrl.includes('?') ? '&' : '?'}connection_limit=${poolSize}&pool_timeout=10&connect_timeout=10`;

    super({
      datasources: { db: { url } },
      log: [
        { level: 'query', emit: 'event' },
        { level: 'warn',  emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
      errorFormat: 'minimal',
    });

    this.setupMiddleware();
    this.setupLogging();
  }

  async onModuleInit(): Promise<void> {
    let attempts = 0;
    while (attempts < 5) {
      try {
        await this.$connect();
        this.logger.log('Database connected');
        return;
      } catch (err) {
        attempts++;
        this.logger.warn(`DB connect attempt ${attempts}/5 failed: ${err}`);
        await new Promise(r => setTimeout(r, attempts * 1000));
      }
    }
    throw new Error('Failed to connect to database after 5 attempts');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  private setupMiddleware(): void {
    this.$use(async (params: Prisma.MiddlewareParams, next) => {
      // Soft delete
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
    (this as any).$on('query', (e: Prisma.QueryEvent) => {
      if (e.duration > 200) {
        this.logger.warn(`Slow query [${e.duration}ms]: ${e.query.substring(0, 150)}`);
      }
    });
    (this as any).$on('warn',  (e: { message: string }) => this.logger.warn(`Prisma: ${e.message}`));
    (this as any).$on('error', (e: { message: string }) => this.logger.error(`Prisma: ${e.message}`));
  }

  private modelHasSoftDelete(model: string | undefined): boolean {
    const models = ['User', 'Student', 'Teacher', 'Staff', 'School'];
    return model ? models.includes(model) : false;
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
