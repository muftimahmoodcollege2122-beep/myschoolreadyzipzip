"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const bull_1 = require("@nestjs/bull");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const throttle_guard_1 = require("./common/guards/throttle.guard");
const prisma_service_1 = require("./database/prisma.service");
const replica_service_1 = require("./database/replica.service");
const cache_service_1 = require("./common/cache/cache.service");
const tenant_context_middleware_1 = require("./common/middleware/tenant-context.middleware");
const tenant_provisioning_processor_1 = require("./jobs/tenant-provisioning.processor");
const auth_module_1 = require("./modules/auth/auth.module");
const tenants_module_1 = require("./modules/tenants/tenants.module");
const library_module_1 = require("./modules/library/library.module");
const transport_module_1 = require("./modules/transport/transport.module");
const school_data_module_1 = require("./modules/school-data/school-data.module");
const students_module_1 = require("./modules/students/students.module");
const teachers_module_1 = require("./modules/teachers/teachers.module");
const attendance_module_1 = require("./modules/attendance/attendance.module");
const fees_module_1 = require("./modules/fees/fees.module");
const grades_module_1 = require("./modules/grades/grades.module");
const exams_module_1 = require("./modules/exams/exams.module");
const timetable_module_1 = require("./modules/timetable/timetable.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const reports_module_1 = require("./modules/reports/reports.module");
const billing_module_1 = require("./modules/billing/billing.module");
const communication_module_1 = require("./modules/communication/communication.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const search_module_1 = require("./modules/search/search.module");
const realtime_module_1 = require("./realtime/realtime.module");
const themes_module_1 = require("./modules/themes/themes.module");
const health_module_1 = require("./common/health/health.module");
const scheduled_jobs_1 = require("./jobs/scheduled.jobs");
const question_bank_module_1 = require("./modules/question-bank/question-bank.module");
const discounts_module_1 = require("./modules/discounts/discounts.module");
const student_records_module_1 = require("./modules/student-records/student-records.module");
const hr_extended_module_1 = require("./modules/hr-extended/hr-extended.module");
const finance_module_1 = require("./modules/finance/finance.module");
const content_module_1 = require("./modules/content/content.module");
const security_module_1 = require("./modules/security/security.module");
const support_tickets_module_1 = require("./modules/support-tickets/support-tickets.module");
const ai_analytics_module_1 = require("./modules/ai-analytics/ai-analytics.module");
const forms_module_1 = require("./modules/forms/forms.module");
const alumni_module_1 = require("./modules/alumni/alumni.module");
const payment_gateway_module_1 = require("./modules/payment-gateway/payment-gateway.module");
const app_config_1 = __importDefault(require("./config/app.config"));
const database_config_1 = __importDefault(require("./config/database.config"));
const redis_config_1 = __importDefault(require("./config/redis.config"));
const aws_config_1 = __importDefault(require("./config/aws.config"));
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(tenant_context_middleware_1.TenantContextMiddleware).forRoutes({ path: '*', method: common_1.RequestMethod.ALL });
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [app_config_1.default, database_config_1.default, redis_config_1.default, aws_config_1.default],
                cache: true,
            }),
            schedule_1.ScheduleModule.forRoot(),
            bull_1.BullModule.forRootAsync({
                useFactory: () => ({
                    redis: {
                        host: process.env.REDIS_HOST ?? 'localhost',
                        port: parseInt(process.env.REDIS_PORT || '6379', 10),
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
            bull_1.BullModule.registerQueue({ name: 'tenant-provisioning' }),
            auth_module_1.AuthModule, tenants_module_1.TenantsModule,
            students_module_1.StudentsModule, teachers_module_1.TeachersModule, attendance_module_1.AttendanceModule, grades_module_1.GradesModule, exams_module_1.ExamsModule, timetable_module_1.TimetableModule,
            fees_module_1.FeesModule, billing_module_1.BillingModule, finance_module_1.FinanceModule, discounts_module_1.DiscountsModule,
            notifications_module_1.NotificationsModule, communication_module_1.CommunicationModule,
            search_module_1.SearchModule, dashboard_module_1.DashboardModule, reports_module_1.ReportsModule, ai_analytics_module_1.AiAnalyticsModule,
            library_module_1.LibraryModule, transport_module_1.TransportModule, school_data_module_1.SchoolDataModule, question_bank_module_1.QuestionBankModule,
            student_records_module_1.StudentRecordsModule, hr_extended_module_1.HrExtendedModule, content_module_1.ContentModule, security_module_1.SecurityModule,
            support_tickets_module_1.SupportTicketsModule, forms_module_1.FormsModule, alumni_module_1.AlumniModule, payment_gateway_module_1.PaymentGatewayModule,
            realtime_module_1.RealtimeModule, health_module_1.HealthModule, themes_module_1.ThemesModule,
        ],
        providers: [
            prisma_service_1.PrismaService,
            replica_service_1.ReplicaService,
            cache_service_1.CacheService,
            scheduled_jobs_1.ScheduledJobs,
            tenant_provisioning_processor_1.TenantProvisioningProcessor,
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: throttle_guard_1.ThrottleGuard },
        ],
        exports: [prisma_service_1.PrismaService, replica_service_1.ReplicaService, cache_service_1.CacheService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map