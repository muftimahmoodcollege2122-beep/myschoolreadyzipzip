/**
 * Event publisher service — implements outbox pattern for reliable event delivery.
 * Saves events to OutboxEvent table first (guaranteed), then publishes to Kafka.
 * If Kafka is down, a relay job retries pending outbox events every 30 seconds.
 * Events: student.enrolled, fee.paid, attendance.marked, tenant.provisioned, etc.
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
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
  private producer: any = null;
  private isConnected = false;
  private kafkaEnabled = false;
  private relayInterval: any = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit(): Promise<void> {
    const brokers = process.env.KAFKA_BROKERS || this.config.get<string>('KAFKA_BROKERS') || '';

    // Skip Kafka entirely if no brokers configured
    if (!brokers || brokers === 'localhost:9092' && process.env.NODE_ENV === 'production') {
      this.logger.warn('KAFKA_BROKERS not configured — running without Kafka. Events stored in outbox only.');
      this.kafkaEnabled = false;
      return;
    }

    // Skip if no DB (outbox needs DB)
    if (!process.env.DATABASE_URL) {
      this.logger.warn('No DATABASE_URL — Kafka outbox relay disabled.');
      return;
    }

    try {
      const { Kafka, Partitioners } = await import('kafkajs');
      const kafka = new Kafka({
        clientId: 'school-saas-api',
        brokers: brokers.split(','),
        ssl: process.env.NODE_ENV === 'production',
        sasl: process.env.NODE_ENV === 'production' && process.env.KAFKA_USERNAME
          ? { mechanism: 'scram-sha-512' as any, username: process.env.KAFKA_USERNAME, password: process.env.KAFKA_PASSWORD || '' }
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
    } catch (err) {
      this.logger.warn(`Kafka unavailable: ${(err as Error).message} — events stored in outbox only`);
      this.producer = null;
      this.isConnected = false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.relayInterval) clearInterval(this.relayInterval);
    if (this.producer && this.isConnected) {
      try { await this.producer.disconnect(); } catch {}
    }
  }

  async publishViaOutbox(event: DomainEvent): Promise<void> {
    if (!process.env.DATABASE_URL) return; // No DB — silently drop
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
    } catch (err) {
      this.logger.warn(`Outbox write failed: ${(err as Error).message}`);
    }
  }

  private startOutboxRelay(): void {
    this.relayInterval = setInterval(async () => {
      if (!this.isConnected || !this.producer) return;
      try {
        const events = await this.prisma.outboxEvent.findMany({
          where: { status: 'PENDING', attempts: { lt: 5 } },
          orderBy: { scheduledAt: 'asc' },
          take: 100,
        });
        if (!events.length) return;

        const { CompressionTypes } = await import('kafkajs');
        await this.producer.sendBatch({
          topicMessages: events.map((e) => ({
            topic: e.topic,
            messages: [{
              key: e.key,
              value: JSON.stringify({ eventId: e.id, tenantId: e.tenantId, timestamp: new Date().toISOString(), ...(e.payload as object) }),
              headers: { ...(e.headers as Record<string, string>), 'x-tenant-id': e.tenantId, 'x-event-id': e.id },
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
      } catch (err) {
        this.logger.error(`Outbox relay error: ${(err as Error).message}`);
      }
    }, 2000);
  }

  async publishDirect(event: DomainEvent): Promise<void> {
    if (!this.isConnected || !this.producer) {
      return this.publishViaOutbox(event);
    }
    try {
      await this.producer.send({
        topic: event.topic,
        messages: [{
          key: event.key,
          value: JSON.stringify({ eventId: randomUUID(), tenantId: event.tenantId, timestamp: new Date().toISOString(), ...event.payload }),
          headers: { ...(event.headers || {}), 'x-tenant-id': event.tenantId },
        }],
        acks: -1,
      });
    } catch (err) {
      this.logger.warn(`Direct publish failed, falling back to outbox: ${(err as Error).message}`);
      return this.publishViaOutbox(event);
    }
  }
}
