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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const correlation_id_interceptor_1 = require("./common/interceptors/correlation-id.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const pii_scrubber_interceptor_1 = require("./common/interceptors/pii-scrubber.interceptor");
const tracing_1 = require("./config/tracing");
async function bootstrap() {
    (0, tracing_1.setupTracing)();
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
        bufferLogs: true,
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 3001);
    const nodeEnv = configService.get('NODE_ENV', 'development');
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: nodeEnv === 'production',
        crossOriginEmbedderPolicy: false,
    }));
    app.use((0, compression_1.default)());
    app.enableCors({
        origin: configService.get('CORS_ORIGINS', 'http://localhost:5000,http://localhost:3002,http://localhost:3003,http://localhost:3004,http://localhost:3005').split(','),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Correlation-ID'],
    });
    app.setGlobalPrefix('api/v1');
    try {
        const { createAdapter } = await Promise.resolve().then(() => __importStar(require('@socket.io/redis-adapter'))).catch(() => ({ createAdapter: null }));
        if (createAdapter && nodeEnv === 'production') {
            const { createClient } = await Promise.resolve().then(() => __importStar(require('redis')));
            const pubClient = createClient({ url: `redis://:${configService.get('REDIS_PASSWORD', '')}@${configService.get('REDIS_HOST', 'localhost')}:${configService.get('REDIS_PORT', 6379)}` });
            const subClient = pubClient.duplicate();
            await Promise.all([pubClient.connect(), subClient.connect()]);
            app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
        }
        else {
            app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
        }
    }
    catch {
        app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    }
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        stopAtFirstError: false,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new correlation_id_interceptor_1.CorrelationIdInterceptor(), new logging_interceptor_1.LoggingInterceptor(), new pii_scrubber_interceptor_1.PiiScrubberInterceptor());
    if (nodeEnv !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('School Management SaaS API')
            .setDescription('Multi-tenant school management platform API')
            .setVersion('1.0')
            .addBearerAuth()
            .addApiKey({ type: 'apiKey', name: 'X-Tenant-ID', in: 'header' }, 'tenant-id')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
        logger.log(`Swagger docs available at /api/docs`);
    }
    app.enableShutdownHooks();
    await app.listen(port, '0.0.0.0');
    logger.log(`Application running on port ${port} [${nodeEnv}]`);
}
bootstrap().catch((err) => {
    console.error('Fatal bootstrap error:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map