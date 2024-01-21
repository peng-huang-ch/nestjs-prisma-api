import { RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { context, trace } from '@opentelemetry/api';

import { Request, Response } from 'express';
import { pick } from 'lodash';
import type { Params } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import pino from 'pino';
import type { Options } from 'pino-http';
import pinoLoki from 'pino-loki';
import pinoPretty from 'pino-pretty';
import type { SerializedError, SerializedRequest, SerializedResponse } from 'pino-std-serializers';
import { createStream } from 'rotating-file-stream';

function createPrettyEntry(app: string, level: pino.Level) {
  const stream = pinoPretty({ translateTime: false, hideObject: false, colorize: true });
  return { level, stream, labels: { app } };
}

/**
 * https://github.com/pinojs/pino/blob/master/docs/transports.md#pino-loki
 * @returns
 */
function createLokiEntry(app: string, level: pino.Level, host: string) {
  const stream = pinoLoki({
    replaceTimestamp: true,
    batching: true,
    interval: 5,

    host, // Change if Loki hostname is different

    labels: { app },
  });
  return { level, stream };
}

/**
 * https://github.com/iccicci/rotating-file-stream?tab=readme-ov-file#initialrotation
 * @returns
 */
function createFileEntry(app: string, level: pino.Level, filepath: string) {
  const { dir, base } = path.parse(filepath);

  const stream = createStream(base, {
    size: '1G', // 10M rotate every 10 MegaBytes written
    interval: '1d', // rotate daily
    compress: 'gzip', // compress rotated files
    path: dir,
  });
  return { level, stream, labels: { app } };
}

/**
 * the destination stream
 * @returns
 */
function getMultiDestinationStream(app: string, level: pino.Level = 'info', filepath?: string, loki?: string) {
  const entries: pino.StreamEntry[] = [createPrettyEntry(app, level)];
  if (filepath) entries.push(createFileEntry(app, level, filepath));
  if (loki) entries.push(createLokiEntry(app, level, loki));

  return pino.multistream(entries);
}

function getFormatters() {
  return {
    level: (label: string) => {
      return { level: label };
    },
    // Workaround for PinoInstrumentation (does not support latest version yet)
    log(object: Record<string, unknown>) {
      const span = trace.getSpan(context.active());
      if (!span) return { ...object };
      const { spanId, traceId } = trace.getSpan(context.active())?.spanContext();
      return { ...object, spanId, traceId, span_id: spanId, trace_id: traceId };
    },
  };
}

function getPinoHttpOption(level: string = 'info'): Options {
  return {
    // https://getpino.io/#/docs/api?id=timestamp-boolean-function
    // Change time value in production log.
    // timestamp: stdTimeFunctions.isoTime,
    level,
    quietReqLogger: false,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: getFormatters(),
    customAttributeKeys: {
      req: 'req',
      res: 'res',
      err: 'err',
      responseTime: 'taken(ms)',
    },
    serializers: {
      req(_req: SerializedRequest) {
        const serialized = { method: _req.method, url: _req.url };
        const request = _req.raw as Request;
        const fields = pick(request, ['headers', 'query', 'body']);
        Object.assign(serialized, fields);
        return serialized;
      },
      res(response: SerializedResponse) {
        const { statusCode: status, ...serialized } = response;
        return Object.assign({ status }, serialized);
      },
      err(_err: SerializedError) {
        const serialized = {
          ..._err,
        };
        return serialized;
      },
    },
    redact: {
      paths: ['password', 'reqBody.password', 'user.password', 'reqBody.user.password'],
    },
    genReqId: function (req, res) {
      const reqId = req.id ?? req.headers['x-request-id'];
      if (reqId) return reqId;
      const id = randomUUID();
      res.setHeader('X-Request-Id', id);
      return id;
    },
    // Define a custom logger level
    customLogLevel(_: Request, res: Response, err: Error) {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return 'warn';
      } else if (res.statusCode >= 500 || err) {
        return 'error';
      } else if (res.statusCode >= 300 && res.statusCode < 400) {
        return 'silent';
      }

      return 'info';
    },
  };
}

export function getLoggerModuleOptions(configService: ConfigService): Params {
  const app = configService.get('OTLP_SERVICE_NAME') || 'app';
  const level = configService.get('LOG_LEVEL') || 'info';
  const filename = configService.get('LOG_FILE');
  const loki = configService.get('LOG_LOKI');

  return {
    pinoHttp: [getPinoHttpOption(level), getMultiDestinationStream(app, level, filename, loki)],
    exclude: [
      { method: RequestMethod.GET, path: '/health' },
      { method: RequestMethod.GET, path: '/queues/*' },
      { method: RequestMethod.GET, path: '/queues/api/*' },
    ],
  };
}
