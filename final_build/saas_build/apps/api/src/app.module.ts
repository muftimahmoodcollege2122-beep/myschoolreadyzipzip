import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ThrottleGuard } from './common/guards/throttle.guard';
import { PrismaService } from './database/prisma.service';
import { ReplicaService } from './database/replica.service';
import { CacheService } from './common/cache/cache.service';
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware';
import { TenantProvisioningProcessor } from './jobs/tenant-provisioning.processor';

import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { LibraryModule } from './modules/library/library.module';
import { TransportModule } from './modules/transport/transport.module';
import { SchoolDataModule } from './modules/school-data/school-data.module';
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
import { QuestionBankModule } from './modules/question-bank/question-bank.module';
import { DiscountsModule } from './modules/discounts/discounts.module';
import { StudentRecordsModule } from './modules/student-records/student-records.module';
import { HrExtendedModule } from './modules/hr-extended/hr-extended.module';
import { FinanceModule } from './modules/finance/finance.module';
import { ContentModule } from './modules/content/content.module';
import { SecurityModule } from './modules/security/security.module';
import { SupportTicketsModule } from './modules/support-tickets/support-tickets.module';
import { AiAnalyticsModule } from './modules/ai-analytics/ai-analytics.module';
import { FormsModule } from './modules/forms/forms.module';
import { AlumniModule } from './modules/alumni/alumni.module';
import { PaymentGatewayModule } from './modules/payment-gateway/payment-gateway.module';

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
    // Bull queue for async tenant provisioning
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host:     process.env.REDIS_HOST     ?? 'localhost',
          port:     +(process.env.REDIS_PORT   ?? 6379),
          password: process.env.REDIS_PASSWORD ?? undefined,
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      }),
    }),
    BullModule.registerQueue({ name: 'tenant-provisioning' }),
    // Core
    AuthModule, TenantsModule,
    // Academic
    StudentsModule, TeachersModule, AttendanceModule, GradesModule, ExamsModule, TimetableModule,
    // Finance
    FeesModule, BillingModule, FinanceModule, DiscountsModule,
    // Communication
    NotificationsModule, CommunicationModule,
    // Analytics
    SearchModule, DashboardModule, ReportsModule, AiAnalyticsModule,
    // Enterprise
    LibraryModule, TransportModule, SchoolDataModule, QuestionBankModule,
    StudentRecordsModule, HrExtendedModule, ContentModule, SecurityModule,
    SupportTicketsModule, FormsModule, AlumniModule, PaymentGatewayModule,
    // Infrastructure
    RealtimeModule, HealthModule, ThemesModule,
  ],
  providers: [
    PrismaService,
    ReplicaService,
    CacheService,
    ScheduledJobs,
    TenantProvisioningProcessor,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottleGuard },
  ],
  exports: [PrismaService, ReplicaService, CacheService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantContextMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
