import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { PrismaModule } from '@src/prisma';
import { ServicesModule } from '@src/services';

import { ProcessHealthIndicator } from './models/process.health';
import { HealthController } from './health.controller';

@Module({
  imports: [
    TerminusModule.forRoot({
      gracefulShutdownTimeoutMs: 1000,
    }),
    PrismaModule,
    ServicesModule,
  ],
  controllers: [HealthController],
  providers: [ProcessHealthIndicator],
})
export class HealthModule {}
