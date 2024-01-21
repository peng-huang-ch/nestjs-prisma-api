import { ConfigService } from '@nestjs/config';

import { ExtractJwt } from 'passport-jwt';

export function jwtFromRequest() {
  return ExtractJwt.fromAuthHeaderAsBearerToken();
}

export function getJwtModuleOptions(configServer: ConfigService) {
  const JWT_SECRET_KEY = configServer.get('JWT_SECRET_KEY');
  const JWT_EXPIRE_IN = configServer.get('JWT_EXPIRE_IN') || '7d';

  return { secret: JWT_SECRET_KEY, signOptions: { expiresIn: JWT_EXPIRE_IN } };
}
