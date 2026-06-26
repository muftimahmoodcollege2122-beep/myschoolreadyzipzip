"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PiiScrubberInterceptor = exports.LoggingInterceptor = exports.CorrelationIdInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const crypto_1 = require("crypto");
let CorrelationIdInterceptor = class CorrelationIdInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const correlationId = request.headers['x-correlation-id'] || (0, crypto_1.randomUUID)();
        request.headers['x-correlation-id'] = correlationId;
        response.setHeader('X-Correlation-ID', correlationId);
        return next.handle();
    }
};
exports.CorrelationIdInterceptor = CorrelationIdInterceptor;
exports.CorrelationIdInterceptor = CorrelationIdInterceptor = __decorate([
    (0, common_1.Injectable)()
], CorrelationIdInterceptor);
let LoggingInterceptor = class LoggingInterceptor {
    constructor() {
        this.logger = new common_1.Logger('HTTP');
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, headers } = request;
        const correlationId = headers['x-correlation-id'];
        const tenantId = request.tenantContext?.tenantId || 'unknown';
        const startTime = Date.now();
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const response = context.switchToHttp().getResponse();
                const duration = Date.now() - startTime;
                const statusCode = response.statusCode;
                this.logger.log(JSON.stringify({
                    correlationId,
                    tenantId,
                    method,
                    url: url.split('?')[0],
                    statusCode,
                    durationMs: duration,
                    timestamp: new Date().toISOString(),
                }));
                if (duration > 500) {
                    this.logger.warn(`Slow response: ${method} ${url.split('?')[0]} took ${duration}ms`);
                }
            },
            error: (err) => {
                const duration = Date.now() - startTime;
                this.logger.error(JSON.stringify({
                    correlationId,
                    tenantId,
                    method,
                    url: url.split('?')[0],
                    error: err?.name || 'UnknownError',
                    durationMs: duration,
                    timestamp: new Date().toISOString(),
                }));
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
const PII_FIELDS = new Set([
    'password', 'passwordHash', 'passwordConfirm',
    'mfaSecret',
    'nationalId', 'medicalNotes', 'salary',
    'creditCard', 'bankAccount',
]);
let PiiScrubberInterceptor = class PiiScrubberInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.tap)((data) => {
            if (data && typeof data === 'object') {
                this.scrub(data);
            }
        }));
    }
    scrub(obj) {
        for (const key of Object.keys(obj)) {
            if (PII_FIELDS.has(key)) {
                obj[key] = '[REDACTED]';
            }
            else if (obj[key] && typeof obj[key] === 'object') {
                this.scrub(obj[key]);
            }
        }
    }
};
exports.PiiScrubberInterceptor = PiiScrubberInterceptor;
exports.PiiScrubberInterceptor = PiiScrubberInterceptor = __decorate([
    (0, common_1.Injectable)()
], PiiScrubberInterceptor);
//# sourceMappingURL=pii-scrubber.interceptor.js.map