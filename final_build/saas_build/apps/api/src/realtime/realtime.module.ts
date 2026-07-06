/**
 * Real-time module — WebSocket gateway powered by Socket.io + Redis adapter.
 * Enables: live attendance updates, real-time notifications, chat, exam result broadcasts.
 * Redis pub/sub adapter allows WebSocket events to work across multiple API pods (horizontal scaling).
 * Rooms are tenant-scoped: users only receive events for their school.
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { RealtimeController } from './realtime.controller';
import { CacheService } from '../common/cache/cache.service';
import { PrismaService } from '../database/prisma.service';
import { AuthService } from '../modules/auth/auth.service';
import { AuditService } from '../common/audit/audit.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_ACCESS_SECRET') || cfg.get<string>('JWT_SECRET') || 'dev-secret',
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [RealtimeController],
  providers: [RealtimeGateway, RealtimeService, CacheService, PrismaService, AuthService, AuditService],
  exports: [RealtimeService, RealtimeGateway],
})
export class RealtimeModule {}
