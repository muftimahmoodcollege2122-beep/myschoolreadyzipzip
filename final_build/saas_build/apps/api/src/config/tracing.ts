export function setupTracing(): void {
  try {
    if (process.env.NODE_ENV === 'test' || process.env.OTEL_DISABLED === 'true') return;
    if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) return;

    const { NodeSDK } = require('@opentelemetry/sdk-node');
    const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
    const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
    const { Resource } = require('@opentelemetry/resources');

    const exporterUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

    const sdk = new NodeSDK({
      resource: new Resource({
        'service.name': 'school-saas-api',
        'service.version': process.env.APP_VERSION || '1.0.0',
        'deployment.environment': process.env.NODE_ENV || 'development',
      }),
      traceExporter: new OTLPTraceExporter({
        url: `${exporterUrl}/v1/traces`,
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': { enabled: false },
        }),
      ],
    });

    sdk.start();
    process.on('SIGTERM', () => {
      sdk?.shutdown().catch(() => {});
    });
  } catch {
    // Non-fatal — tracing is optional
  }
}
