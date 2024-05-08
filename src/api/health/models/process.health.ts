import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class ProcessHealthIndicator extends HealthIndicator {
  async isHealthy(key: string = 'http'): Promise<HealthIndicatorResult> {
    return this.getStatus(key, true, { uptime: Math.floor(process.uptime()) });
  }
}
