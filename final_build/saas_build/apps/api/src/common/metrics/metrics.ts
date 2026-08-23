/**
 * Prometheus instrumentation.
 *
 * Metric names/labels here MUST match what infrastructure/monitoring/alert-rules.yml
 * and infrastructure/kubernetes/monitoring/alerts.yaml already query for
 * (http_requests_total, http_request_duration_seconds) — those alert rules
 * were written before this instrumentation existed, so nothing to update there.
 */
import type { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

export const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry, prefix: 'nodejs_' });

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'] as const,
  registers: [registry],
});

export const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'] as const,
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
});

/** Collapses `/api/v1/students/:id` style params so cardinality stays bounded. */
function normalizeRoute(req: Request): string {
  // req.route.path is only populated *after* routing resolves; Nest/Express
  // sets it once a matching handler is found, which is exactly what we want
  // here (raw dynamic segments like UUIDs would otherwise blow up cardinality).
  const routePath = (req as any).route?.path;
  if (routePath) {
    const base = (req.baseUrl || '') + routePath;
    return base || req.path;
  }
  return req.path.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id')
                  .replace(/\/\d+(?=\/|$)/g, '/:id');
}

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/metrics') return next();
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const route = normalizeRoute(req);
    const status = String(res.statusCode);
    const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
    httpRequestsTotal.inc({ method: req.method, route, status });
    httpRequestDurationSeconds.observe({ method: req.method, route, status }, durationSeconds);
  });
  next();
}
