import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { getGoogleOAuthOptions, getUserFromGoogleProfile } from '@src/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const options = getGoogleOAuthOptions(configService);
    super(options);
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const user = getUserFromGoogleProfile(profile._json);
    return Object.assign({}, user, {
      accessToken,
      refreshToken,
    });
  }
}
