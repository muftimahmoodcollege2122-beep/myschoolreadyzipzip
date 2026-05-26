import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

// ─────────────────────────────────────────────
// Correlation ID Interceptor
// Ensures every request has a traceable ID
// ─────────────────────────────────────────────
@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const correlationId =
      (request.headers['x-correlation-id'] as string) || randomUUID();

    request.headers['x-correlation-id'] = correlationId;
    response.setHeader('X-Correlation-ID', correlationId);

    return next.handle();
  }
}

// ─────────────────────────────────────────────
// Logging Interceptor
// Structured logs for every request/response
// ─────────────────────────────────────────────
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, headers } = request;
    const correlationId = headers['x-correlation-id'] as string;
    const tenantId = (request as any).tenantContext?.tenantId || 'unknown';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Response>();
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Structured log — no PII (no email, name, student data)
          this.logger.log(
            JSON.stringify({
              correlationId,
              tenantId,
              method,
              // Strip query params from URL to avoid PII leakage
              url: url.split('?')[0],
              statusCode,
              durationMs: duration,
              timestamp: new Date().toISOString(),
            }),
          );

          // Warn on slow responses
          if (duration > 500) {
            this.logger.warn(
              `Slow response: ${method} ${url.split('?')[0]} took ${duration}ms`,
            );
          }
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            JSON.stringify({
              correlationId,
              tenantId,
              method,
              url: url.split('?')[0],
              error: err?.name || 'UnknownError',
              durationMs: duration,
              timestamp: new Date().toISOString(),
            }),
          );
        },
      }),
    );
  }
}

// ─────────────────────────────────────────────
// PII Scrubber Interceptor
// Ensures PII never appears in response logs
// ─────────────────────────────────────────────
const PII_FIELDS = new Set([
  'password', 'passwordHash', 'passwordConfirm',
  'refreshToken', 'accessToken', 'mfaSecret',
  'nationalId', 'medicalNotes', 'salary',
  'creditCard', 'bankAccount',
]);

@Injectable()
export class PiiScrubberInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap((data) => {
        if (data && typeof data === 'object') {
          this.scrub(data);
        }
      }),
    );
  }

  private scrub(obj: Record<string, unknown>): void {
    for (const key of Object.keys(obj)) {
      if (PII_FIELDS.has(key)) {
        obj[key] = '[REDACTED]';
      } else if (obj[key] && typeof obj[key] === 'object') {
        this.scrub(obj[key] as Record<string, unknown>);
      }
    }
  }
}
