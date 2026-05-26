import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly config: ConfigService) {
    super({
      datasources: {
        db: { url: config.get<string>('DATABASE_URL') },
      },
      log: [
        { level: 'query', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
      errorFormat: 'minimal', // never expose internal DB structure in errors
    });

    this.setupMiddleware();
    this.setupLogging();
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  private setupMiddleware(): void {
    // Soft delete middleware - never hard delete, set deletedAt
    this.$use(async (params: Prisma.MiddlewareParams, next) => {
      if (params.action === 'delete') {
        params.action = 'update';
        params.args.data = { deletedAt: new Date() };
      }

      if (params.action === 'deleteMany') {
        params.action = 'updateMany';
        params.args.data = { deletedAt: new Date() };
      }

      // Filter out soft-deleted records by default
      if (params.action === 'findFirst' || params.action === 'findMany') {
        if (!params.args) params.args = {};
        if (!params.args.where) params.args.where = {};
        // Only apply if model has deletedAt
        if (this.modelHasSoftDelete(params.model)) {
          params.args.where.deletedAt = null;
        }
      }

      return next(params);
    });
  }

  private setupLogging(): void {
    // Log slow queries (> 100ms threshold)
    (this as any).$on('query', (e: Prisma.QueryEvent) => {
      if (e.duration > 100) {
        this.logger.warn(
          `Slow query detected: ${e.duration}ms — ${e.query.substring(0, 200)}`,
        );
      }
    });

    (this as any).$on('warn', (e: { message: string }) => {
      this.logger.warn(`Prisma warning: ${e.message}`);
    });

    (this as any).$on('error', (e: { message: string }) => {
      this.logger.error(`Prisma error: ${e.message}`);
    });
  }

  private modelHasSoftDelete(model: string | undefined): boolean {
    const softDeleteModels = ['User', 'Student', 'Teacher', 'Staff', 'School'];
    return model ? softDeleteModels.includes(model) : false;
  }

  /**
   * Execute raw query with tenant isolation enforcement.
   * Use this for complex queries that Prisma cannot express.
   */
  async queryTenantScoped<T>(
    tenantId: string,
    query: (prisma: PrismaClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      // Set session-level tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
      return query(tx as unknown as PrismaClient);
    });
  }

  /**
   * Health check — verify DB connectivity
   */
  async ping(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
