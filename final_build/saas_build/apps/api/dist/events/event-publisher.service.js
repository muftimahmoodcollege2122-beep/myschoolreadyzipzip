"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EventPublisher_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventPublisher = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma.service");
const crypto_1 = require("crypto");
let EventPublisher = EventPublisher_1 = class EventPublisher {
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
        this.logger = new common_1.Logger(EventPublisher_1.name);
        this.producer = null;
        this.isConnected = false;
        this.kafkaEnabled = false;
        this.relayInterval = null;
    }
    async onModuleInit() {
        const brokers = process.env.KAFKA_BROKERS || this.config.get('KAFKA_BROKERS') || '';
        if (!brokers || brokers === 'localhost:9092' && process.env.NODE_ENV === 'production') {
            this.logger.warn('KAFKA_BROKERS not configured — running without Kafka. Events stored in outbox only.');
            this.kafkaEnabled = false;
            return;
        }
        if (!process.env.DATABASE_URL) {
            this.logger.warn('No DATABASE_URL — Kafka outbox relay disabled.');
            return;
        }
        try {
            const { Kafka, Partitioners } = await Promise.resolve().then(() => __importStar(require('kafkajs')));
            const kafka = new Kafka({
                clientId: 'school-saas-api',
                brokers: brokers.split(','),
                ssl: process.env.NODE_ENV === 'production',
                sasl: process.env.NODE_ENV === 'production' && process.env.KAFKA_USERNAME
                    ? { mechanism: 'scram-sha-512', username: process.env.KAFKA_USERNAME, password: process.env.KAFKA_PASSWORD || '' }
                    : undefined,
                retry: { initialRetryTime: 300, retries: 2 },
                connectionTimeout: 5000,
            });
            this.producer = kafka.producer({
                createPartitioner: Partitioners.LegacyPartitioner,
                idempotent: false,
                maxInFlightRequests: 5,
            });
            await this.producer.connect();
            this.isConnected = true;
            this.kafkaEnabled = true;
            this.logger.log('Kafka producer connected');
            this.startOutboxRelay();
        }
        catch (err) {
            this.logger.warn(`Kafka unavailable: ${err.message} — events stored in outbox only`);
            this.producer = null;
            this.isConnected = false;
        }
    }
    async onModuleDestroy() {
        if (this.relayInterval)
            clearInterval(this.relayInterval);
        if (this.producer && this.isConnected) {
            try {
                await this.producer.disconnect();
            }
            catch { }
        }
    }
    async publishViaOutbox(event) {
        if (!process.env.DATABASE_URL)
            return;
        try {
            await this.prisma.outboxEvent.create({
                data: {
                    tenantId: event.tenantId,
                    topic: event.topic,
                    key: event.key,
                    payload: event.payload,
                    headers: event.headers || {},
                    status: 'PENDING',
                },
            });
        }
        catch (err) {
            this.logger.warn(`Outbox write failed: ${err.message}`);
        }
    }
    startOutboxRelay() {
        this.relayInterval = setInterval(async () => {
            if (!this.isConnected || !this.producer)
                return;
            try {
                const events = await this.prisma.outboxEvent.findMany({
                    where: { status: 'PENDING', attempts: { lt: 5 } },
                    orderBy: { scheduledAt: 'asc' },
                    take: 100,
                });
                if (!events.length)
                    return;
                const { CompressionTypes } = await Promise.resolve().then(() => __importStar(require('kafkajs')));
                await this.producer.sendBatch({
                    topicMessages: events.map((e) => ({
                        topic: e.topic,
                        messages: [{
                                key: e.key,
                                value: JSON.stringify({ eventId: e.id, tenantId: e.tenantId, timestamp: new Date().toISOString(), ...e.payload }),
                                headers: { ...e.headers, 'x-tenant-id': e.tenantId, 'x-event-id': e.id },
                            }],
                    })),
                    compression: CompressionTypes.GZIP,
                    acks: -1,
                });
                await this.prisma.outboxEvent.updateMany({
                    where: { id: { in: events.map((e) => e.id) } },
                    data: { status: 'SENT', sentAt: new Date() },
                });
                this.logger.debug(`Outbox relay published ${events.length} events`);
            }
            catch (err) {
                this.logger.error(`Outbox relay error: ${err.message}`);
            }
        }, 2000);
    }
    async publishDirect(event) {
        if (!this.isConnected || !this.producer) {
            return this.publishViaOutbox(event);
        }
        try {
            await this.producer.send({
                topic: event.topic,
                messages: [{
                        key: event.key,
                        value: JSON.stringify({ eventId: (0, crypto_1.randomUUID)(), tenantId: event.tenantId, timestamp: new Date().toISOString(), ...event.payload }),
                        headers: { ...(event.headers || {}), 'x-tenant-id': event.tenantId },
                    }],
                acks: -1,
            });
        }
        catch (err) {
            this.logger.warn(`Direct publish failed, falling back to outbox: ${err.message}`);
            return this.publishViaOutbox(event);
        }
    }
};
exports.EventPublisher = EventPublisher;
exports.EventPublisher = EventPublisher = EventPublisher_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], EventPublisher);
//# sourceMappingURL=event-publisher.service.js.map