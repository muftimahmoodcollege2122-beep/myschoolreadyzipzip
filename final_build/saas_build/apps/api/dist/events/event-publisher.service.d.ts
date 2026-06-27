import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
export interface DomainEvent {
    topic: string;
    key: string;
    payload: Record<string, unknown>;
    headers?: Record<string, string>;
    tenantId: string;
}
export declare class EventPublisher implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly prisma;
    private readonly logger;
    private producer;
    private isConnected;
    private kafkaEnabled;
    private relayInterval;
    constructor(config: ConfigService, prisma: PrismaService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    publishViaOutbox(event: DomainEvent): Promise<void>;
    private startOutboxRelay;
    publishDirect(event: DomainEvent): Promise<void>;
}
