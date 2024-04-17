import { ConfigService } from '@nestjs/config';

import { redisStore } from 'cache-manager-ioredis-yet';
import { parseURL } from 'ioredis/built/utils';

export function getRedisOpt(configService: ConfigService) {
  const redisUrl = configService.get<string>('REDIS_URL')!;
  return Object.assign({ maxRetriesPerRequest: 20 }, parseURL(redisUrl));
}

export function getRedisModuleOptions(configService: ConfigService) {
  return { config: getRedisOpt(configService) };
}

export async function getCacheModuleOptions(configService: ConfigService) {
  const opt = getRedisOpt(configService);
  const store = await redisStore(opt);
  return {
    store,
    ttl: 10 * 1000,
  };
}
