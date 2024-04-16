// eslint-disable-next-line simple-import-sort/imports
import { otelSDK } from './tracing'; // Make sure it's the first line

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

import { AppModule } from './app.module';

async function bootstrap() {
  otelSDK.start();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  const logger = app.get(Logger);

  const configService = app.get(ConfigService);

  const NODE_ENV: string = configService.get('NODE_ENV')!;
  const HTTP_PORT: string = configService.get('HTTP_PORT')!;

  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useLogger(logger);
  app.disable('x-powered-by');

  const options = new DocumentBuilder().setTitle('nestjs-prisma - API description').setVersion('1.0').build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  await app.listen(HTTP_PORT);

  const url = await app.getUrl();
  logger.log(`📈 Started OTEL SDK, Application is running on: ${url} env ${NODE_ENV}`);
}

bootstrap();
