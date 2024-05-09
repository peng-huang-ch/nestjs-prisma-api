/**
 * https://www.npmjs.com/package/@opentelemetry/sdk-node
 * https://github.com/open-telemetry/opentelemetry-js#package-version-compatibility
 * opentelemetry libraries versions
 * "@opentelemetry/api": "^1.8.0",
 * "@opentelemetry/auto-instrumentations-node": "^0.44.0",
 * "@opentelemetry/context-async-hooks": "1.23.0",
 * "@opentelemetry/core": "1.23.0",
 * "@opentelemetry/exporter-prometheus": "^0.50.0",
 * "@opentelemetry/exporter-trace-otlp-http": "^0.50.0",
 * "@opentelemetry/propagator-b3": "1.23.0",
 * "@opentelemetry/propagator-jaeger": "1.23.0",
 * "@opentelemetry/resources": "1.23.0",
 * "@opentelemetry/sdk-metrics": "1.23.0",
 * "@opentelemetry/sdk-node": "^0.50.0",
 * "@opentelemetry/sdk-trace-base": "1.23.0",
 * "@opentelemetry/semantic-conventions": "1.23.0",
 * "@prisma/instrumentation": "^5.13.0",
 */
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { PrismaInstrumentation } from '@prisma/instrumentation';

import 'dotenv/config';

const { OTLP_SERVICE_NAME = 'nestjs-app', OTLP_PROM_PORT, OTLP_TRACES_ENDPOINT } = process.env;

const prometheusExporter = new PrometheusExporter({
  endpoint: '/metrics',
  port: Number(OTLP_PROM_PORT) || 8081,
});

const traceExporter = new OTLPTraceExporter({ url: OTLP_TRACES_ENDPOINT });

const spanProcessor = new BatchSpanProcessor(traceExporter);

export const otelSDK = new NodeSDK({
  // Optional - If omitted, the metrics SDK will not be initialized
  metricReader: prometheusExporter,
  // metricReader: new PrometheusExporter({ port: 8081, endpoint: '/metrics' }),
  spanProcessor: spanProcessor,
  contextManager: new AsyncLocalStorageContextManager(),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-nestjs-core': { enabled: false },
      '@opentelemetry/instrumentation-pg': { enabled: true },
      '@opentelemetry/instrumentation-pino': { enabled: true },
      '@opentelemetry/instrumentation-http': { enabled: true },
      '@opentelemetry/instrumentation-ioredis': { enabled: true },
      '@opentelemetry/instrumentation-express': { enabled: true, ignoreLayers: ['/health'] },
    }),
    new PrismaInstrumentation(),
  ],
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: OTLP_SERVICE_NAME,
  }),
  textMapPropagator: new CompositePropagator({
    propagators: [
      new W3CTraceContextPropagator(),
      new W3CBaggagePropagator(),
      new B3Propagator(),
      new B3Propagator({
        injectEncoding: B3InjectEncoding.MULTI_HEADER,
      }),
    ],
  }),
});

// You can also use the shutdown method to gracefully shut down the SDK before process shutdown
// or on some operating system signal.
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('SDK shut down successfully'),
      (err) => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});
