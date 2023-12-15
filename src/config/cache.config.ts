import { ConfigService } from '@nestjs/config';

import { redisStore } from 'cache-manager-ioredis-yet';
import { parseURL } from 'ioredis/built/utils';

export function getRedisOpt(configService: ConfigService) {
  return Object.assign({ maxRetriesPerRequest: 20 }, parseURL(configService.get('REDIS_URL')));
}

export function getRedisModuleOpt(configService: ConfigService) {
  return { config: getRedisOpt(configService) };
}

export async function getCacheOptions(configService: ConfigService) {
  const opt = getRedisOpt(configService);
  const store = await redisStore(opt);
  return {
    store,
    ttl: 10 * 1000,
  };
}
