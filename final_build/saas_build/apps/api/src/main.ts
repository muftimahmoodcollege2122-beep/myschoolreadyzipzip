/**
 * Entry point of the MySchool NestJS API.
 * Bootstraps the app, sets up global pipes, guards, filters, Swagger docs, CORS, Helmet security headers,
 * compression, WebSocket adapter, and starts listening on the configured PORT.
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import helmet from 'helmet';
import compression from 'compression';
import express from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { CorrelationIdInterceptor } from './common/interceptors/correlation-id.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { PiiScrubberInterceptor } from './common/interceptors/pii-scrubber.interceptor';
import { setupTracing } from './config/tracing';
import { UPLOADS_DIR } from './config/uploads.config';

async function bootstrap() {
  // Initialize OpenTelemetry tracing BEFORE anything else
  setupTracing();

  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const port = parseInt(configService.get('PORT') || '3001', 10);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: nodeEnv === 'production',
    crossOriginEmbedderPolicy: false,
  }));

  // Compression
  app.use(compression());

  // Serve uploaded files (school logos, etc.) publicly — NOT under the
  // /api/v1 prefix, matched separately by a Next.js rewrite. See UPLOADS_DIR
  // above for persistence caveats.
  app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d', fallthrough: true }));

  // CORS
  const corsOrigins = configService.get<string>('CORS_ORIGINS', '');
  app.enableCors({
    origin: corsOrigins ? corsOrigins.split(',') : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Correlation-ID'],
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // WebSocket adapter with Redis (for clustering) — multi-pod WS sync in prod.
  // NOTE: previously connected pubClient/subClient but never passed them to
  // the adapter, so every pod ran an isolated in-memory Socket.IO instance —
  // realtime events (notifications, live attendance, etc.) silently didn't
  // propagate across pods. Fixed by extending IoAdapter with createIOServer().
  try {
    if (nodeEnv === 'production') {
      const { createAdapter } = await import('@socket.io/redis-adapter');
      const { createClient } = await import('redis');
      const redisUrl = `redis://:${configService.get('REDIS_PASSWORD', '')}@${configService.get('REDIS_HOST', 'localhost')}:${parseInt(configService.get('REDIS_PORT') || '6379', 10)}`;
      const pubClient = createClient({ url: redisUrl });
      const subClient = pubClient.duplicate();
      await Promise.all([pubClient.connect(), subClient.connect()]);

      class RedisIoAdapter extends IoAdapter {
        private readonly adapterConstructor = createAdapter(pubClient, subClient);
        createIOServer(port: number, options?: any) {
          const server = super.createIOServer(port, options);
          server.adapter(this.adapterConstructor);
          return server;
        }
      }
      app.useWebSocketAdapter(new RedisIoAdapter(app));
      logger.log('WebSocket adapter: Redis-backed (multi-pod clustering enabled)');
    } else {
      app.useWebSocketAdapter(new IoAdapter(app));
    }
  } catch (err) {
    logger.error(`Redis WS adapter setup failed, falling back to in-memory: ${(err as Error).message}`);
    app.useWebSocketAdapter(new IoAdapter(app));
  }

  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    stopAtFirstError: false,
  }));

  // Global filters - NEVER leak internal errors
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new CorrelationIdInterceptor(),
    new LoggingInterceptor(),
    new PiiScrubberInterceptor(),
  );

  // Swagger (non-production only)
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('School Management SaaS API')
      .setDescription('Multi-tenant school management platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: 'X-Tenant-ID', in: 'header' }, 'tenant-id')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`Swagger docs available at /api/docs`);
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
  logger.log(`Application running on port ${port} [${nodeEnv}]`);
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
