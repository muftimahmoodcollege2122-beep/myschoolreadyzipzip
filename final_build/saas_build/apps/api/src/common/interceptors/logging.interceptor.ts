/**
 * Request/response logging interceptor — logs method, path, status code, and duration.
 * Attaches correlation ID to every response for distributed tracing.
 * Skips logging for health check endpoints to reduce noise.
 */

export { LoggingInterceptor } from './pii-scrubber.interceptor';
