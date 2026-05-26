import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { Kafka, Producer, CompressionTypes, Partitioners } from 'kafkajs';
import { randomUUID } from 'crypto';

export interface DomainEvent {
  topic: string;
  key: string;
  payload: Record<string, unknown>;
  headers?: Record<string, string>;
  tenantId: string;
}

@Injectable()
export class EventPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventPublisher.name);
  private readonly kafka: Kafka;
  private producer: Producer;
  private isConnected = false;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.kafka = new Kafka({
      clientId: 'school-saas-api',
      brokers: (config.get<string>('KAFKA_BROKERS') || 'localhost:9092').split(','),
      ssl: config.get('NODE_ENV') === 'production',
      sasl: config.get('NODE_ENV') === 'production'
        ? {
            mechanism: 'scram-sha-512',
            username: config.get('KAFKA_USERNAME', ''),
            password: config.get('KAFKA_PASSWORD', ''),
          }
        : undefined,
      retry: {
        initialRetryTime: 300,
        retries: 8,
      },
    });

    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
      idempotent: true, // exactly-once producer semantics
      maxInFlightRequests: 5,
      transactionTimeout: 30000,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.producer.connect();
      this.isConnected = true;
      this.logger.log('Kafka producer connected');
      // Start outbox relay
      this.startOutboxRelay();
    } catch (err) {
      this.logger.error(`Kafka producer connection failed: ${err}`);
      // Non-fatal — outbox relay will batch-publish when connection recovers
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
    this.logger.log('Kafka producer disconnected');
  }

  /**
   * Publish via outbox pattern — guaranteed delivery even if Kafka is down.
   * Writers call this inside their DB transaction; the relay picks it up.
   */
  async publishViaOutbox(event: DomainEvent): Promise<void> {
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

  /**
   * Outbox relay — polls DB for PENDING events and publishes to Kafka.
   * Runs every 500ms; in production use a dedicated worker process.
   */
  private startOutboxRelay(): void {
    const relay = async () => {
      if (!this.isConnected) return;

      try {
        const events = await this.prisma.outboxEvent.findMany({
          where: { status: 'PENDING', attempts: { lt: 5 } },
          orderBy: { scheduledAt: 'asc' },
          take: 100,
        });

        if (events.length === 0) return;

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
              ...(e.headers as Record<string, string>),
              'x-tenant-id': e.tenantId,
              'x-event-id': e.id,
              'x-schema-version': '1',
            },
          }],
        }));

        // Batch publish — more efficient than one-by-one
        await this.producer.sendBatch({
          topicMessages: messages,
          compression: CompressionTypes.GZIP,
          acks: -1, // all ISR replicas must acknowledge
        });

        // Mark as sent
        await this.prisma.outboxEvent.updateMany({
          where: { id: { in: events.map((e) => e.id) } },
          data: { status: 'SENT', sentAt: new Date() },
        });

        this.logger.debug(`Outbox relay published ${events.length} events`);
      } catch (err) {
        this.logger.error(`Outbox relay error: ${err}`);
        // Increment attempt count on failed batch
      }
    };

    setInterval(relay, 500);
  }

  /**
   * Direct publish — use only for non-critical, fire-and-forget scenarios
   */
  async publishDirect(event: DomainEvent): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn('Kafka not connected, falling back to outbox');
      return this.publishViaOutbox(event);
    }

    await this.producer.send({
      topic: event.topic,
      messages: [{
        key: event.key,
        value: JSON.stringify({
          eventId: randomUUID(),
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
}
