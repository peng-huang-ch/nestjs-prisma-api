import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { OpenTelemetryModule } from 'nestjs-otel';
import { LoggerModule } from 'nestjs-pino';

import { ApiModule } from '@src/api/api.module';
import { getCacheOptions, getLoggerOptions, getOtelOptions, validate } from '@src/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => getCacheOptions(configService),
      inject: [ConfigService],
    }),
    OpenTelemetryModule.forRootAsync({
      useFactory: async () => getOtelOptions(),
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService) => getLoggerOptions(configService),
    }),
    ApiModule,
  ],
})
export class AppModule {}
