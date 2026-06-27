import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly logger;
    private isConnected;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private setupMiddleware;
    private setupLogging;
    private modelHasSoftDelete;
    queryTenantScoped<T>(tenantId: string, query: (prisma: PrismaClient) => Promise<T>): Promise<T>;
    ping(): Promise<boolean>;
}
