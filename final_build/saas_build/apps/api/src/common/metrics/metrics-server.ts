import http from 'http';
import { Logger } from '@nestjs/common';
import { registry } from './metrics';

/**
 * Runs a tiny dedicated HTTP server for /metrics, separate from the main
 * Nest app. Matches the Dockerfile (EXPOSE 3001 5000) and the
 * prometheus.io/port: "5000" pod annotation in api-deployment.yaml —
 * both existed before this was wired up.
 *
 * Deliberately NOT a Nest controller: metrics must stay reachable even if
 * app-level guards, the /api/v1 prefix, or tenant-context resolution ever
 * misbehave, and Prometheus shouldn't need auth headers or a tenant ID to
 * scrape.
 */
export function startMetricsServer(port = parseInt(process.env.METRICS_PORT || '5000', 10)) {
  const logger = new Logger('MetricsServer');
  const server = http.createServer(async (req, res) => {
    if (req.url === '/metrics') {
      try {
        res.writeHead(200, { 'Content-Type': registry.contentType });
        res.end(await registry.metrics());
      } catch (err) {
        res.writeHead(500);
        res.end((err as Error).message);
      }
      return;
    }
    if (req.url === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('ok');
      return;
    }
    res.writeHead(404);
    res.end();
  });

  server.listen(port, '0.0.0.0', () => {
    logger.log(`Metrics server listening on :${port}/metrics`);
  });

  return server;
}
