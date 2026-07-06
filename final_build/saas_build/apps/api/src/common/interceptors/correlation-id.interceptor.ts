/**
 * Correlation ID interceptor — generates or passes through X-Correlation-ID header.
 * Every request gets a unique ID that's logged and returned in the response.
 * Used to trace a single request across API logs, queue jobs, and external services.
 */

// Re-export all interceptors from the single source file
export { CorrelationIdInterceptor, LoggingInterceptor, PiiScrubberInterceptor } from './pii-scrubber.interceptor';
