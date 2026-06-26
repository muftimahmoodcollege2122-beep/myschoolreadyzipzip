import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class CacheService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly logger;
    private client;
    private isDown;
    private readonly PREFIX;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    delPattern(pattern: string): Promise<void>;
    mget<T>(keys: string[]): Promise<(T | null)[]>;
    mset(entries: {
        key: string;
        value: unknown;
        ttl?: number;
    }[]): Promise<void>;
    remember<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T>;
    increment(key: string, ttlSeconds?: number): Promise<number>;
    ping(): Promise<boolean>;
    get healthy(): boolean;
}
