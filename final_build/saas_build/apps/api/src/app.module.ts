import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { PrismaService } from './database/prisma.service';
import { CacheService } from './common/cache/cache.service';
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware';

import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { FeesModule } from './modules/fees/fees.module';
import { GradesModule } from './modules/grades/grades.module';
import { ExamsModule } from './modules/exams/exams.module';
import { TimetableModule } from './modules/timetable/timetable.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { BillingModule } from './modules/billing/billing.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SearchModule } from './modules/search/search.module';
import { RealtimeModule } from './realtime/realtime.module';
import { ThemesModule } from './modules/themes/themes.module';
import { HealthModule } from './common/health/health.module';
import { ScheduledJobs } from './jobs/scheduled.jobs';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import awsConfig from './config/aws.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, awsConfig],
      cache: true,
    }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host:     process.env.REDIS_HOST     ?? 'localhost',
          port:     +(process.env.REDIS_PORT   ?? 6379),
          password: process.env.REDIS_PASSWORD ?? undefined,
        },
      }),
    }),
    // Core
    AuthModule,
    TenantsModule,
    // Academic
    StudentsModule,
    TeachersModule,
    AttendanceModule,
    GradesModule,
    ExamsModule,
    TimetableModule,
    // Finance
    FeesModule,
    BillingModule,
    // Communication & Notifications
    NotificationsModule,
    CommunicationModule,
    // Analytics & Search
    SearchModule,
    DashboardModule,
    ReportsModule,
    // Infrastructure
    RealtimeModule,
    HealthModule,
    ThemesModule,
  ],
  providers: [
    PrismaService,
    CacheService,
    ScheduledJobs,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
