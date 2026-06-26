"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EventPublisher_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventPublisher = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma.service");
const kafkajs_1 = require("kafkajs");
const crypto_1 = require("crypto");
let EventPublisher = EventPublisher_1 = class EventPublisher {
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
        this.logger = new common_1.Logger(EventPublisher_1.name);
        this.isConnected = false;
        this.kafka = new kafkajs_1.Kafka({
            clientId: 'school-saas-api',
            brokers: (config.get('KAFKA_BROKERS') || 'localhost:9092').split(','),
            ssl: config.get('NODE_ENV') === 'production',
            sasl: config.get('NODE_ENV') === 'production'
                ? {
                    mechanism: 'scram-sha-512',
                    username: config.get('KAFKA_USERNAME', ''),
                    password: config.get('KAFKA_PASSWORD', ''),
                }
                : undefined,
            retry: {
                initialRetryTime: 100,
                retries: 1,
            },
        });
        this.producer = this.kafka.producer({
            createPartitioner: kafkajs_1.Partitioners.LegacyPartitioner,
            idempotent: false,
            maxInFlightRequests: 5,
        });
    }
    async onModuleInit() {
        try {
            await this.producer.connect();
            this.isConnected = true;
            this.logger.log('Kafka producer connected');
            this.startOutboxRelay();
        }
        catch (err) {
            this.logger.error(`Kafka producer connection failed: ${err}`);
        }
    }
    async onModuleDestroy() {
        await this.producer.disconnect();
        this.logger.log('Kafka producer disconnected');
    }
    async publishViaOutbox(event) {
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
    startOutboxRelay() {
        const relay = async () => {
            if (!this.isConnected)
                return;
            try {
                const events = await this.prisma.outboxEvent.findMany({
                    where: { status: 'PENDING', attempts: { lt: 5 } },
                    orderBy: { scheduledAt: 'asc' },
                    take: 100,
                });
                if (events.length === 0)
                    return;
                const messages = events.map((e) => ({
                    topic: e.topic,
                    messages: [{
                            key: e.key,
                            value: JSON.stringify({
                                eventId: e.id,
                                tenantId: e.tenantId,
                                timestamp: new Date().toISOString(),
                                ...e.payload,
                            }),
                            headers: {
                                ...e.headers,
                                'x-tenant-id': e.tenantId,
                                'x-event-id': e.id,
                                'x-schema-version': '1',
                            },
                        }],
                }));
                await this.producer.sendBatch({
                    topicMessages: messages,
                    compression: kafkajs_1.CompressionTypes.GZIP,
                    acks: -1,
                });
                await this.prisma.outboxEvent.updateMany({
                    where: { id: { in: events.map((e) => e.id) } },
                    data: { status: 'SENT', sentAt: new Date() },
                });
                this.logger.debug(`Outbox relay published ${events.length} events`);
            }
            catch (err) {
                this.logger.error(`Outbox relay error: ${err}`);
            }
        };
        setInterval(relay, 500);
    }
    async publishDirect(event) {
        if (!this.isConnected) {
            this.logger.warn('Kafka not connected, falling back to outbox');
            return this.publishViaOutbox(event);
        }
        await this.producer.send({
            topic: event.topic,
            messages: [{
                    key: event.key,
                    value: JSON.stringify({
                        eventId: (0, crypto_1.randomUUID)(),
                        tenantId: event.tenantId,
                        timestamp: new Date().toISOString(),
                        ...event.payload,
                    }),
                    headers: {
                        ...(event.headers || {}),
                        'x-tenant-id': event.tenantId,
                    },
                }],
            acks: -1,
        });
    }
};
exports.EventPublisher = EventPublisher;
exports.EventPublisher = EventPublisher = EventPublisher_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], EventPublisher);
//# sourceMappingURL=event-publisher.service.js.map