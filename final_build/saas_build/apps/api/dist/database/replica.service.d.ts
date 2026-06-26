import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
export declare class ReplicaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly logger;
    private isReplica;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
