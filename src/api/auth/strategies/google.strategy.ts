import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { getGoogleOAuthOptions } from '@src/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const options = getGoogleOAuthOptions(configService);
    super(options);
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const obj = profile._json;

    const user = {
      googleId: obj.sub,
      name: obj.name,
      email: obj.email,
      verified: obj.email_verified,
      locale: obj.locale,
      picture: obj.picture,

      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
