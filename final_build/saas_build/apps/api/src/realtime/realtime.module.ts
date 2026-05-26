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
        secret: cfg.get('JWT_ACCESS_SECRET', cfg.get('JWT_SECRET', 'dev-secret')),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [RealtimeController],
  providers: [RealtimeGateway, RealtimeService, CacheService, PrismaService, AuthService, AuditService],
  exports: [RealtimeService, RealtimeGateway],
})
export class RealtimeModule {}
