import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, MicroserviceHealthIndicator, PrismaHealthIndicator } from '@nestjs/terminus';

import type { RedisOptions } from 'ioredis';

import { getRedisOpt } from '@src/config';
import { PrismaService } from '@src/prisma';

import { ProcessHealthIndicator } from './models/process.health';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  redisOpt: RedisOptions;
  public constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly health: HealthCheckService,
    private readonly db: PrismaHealthIndicator,
    private readonly process: ProcessHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
  ) {
    this.redisOpt = getRedisOpt(this.config);
  }

  @Get()
  @HealthCheck()
  public async healthCheck() {
    return this.health.check([
      async () => this.db.pingCheck('database', this.prisma), // db

      async () => this.process.isHealthy('http'), // http
      async () =>
        this.microservice.pingCheck('redis', {
          transport: Transport.REDIS,
          options: this.redisOpt,
        }),
    ]);
  }
}
