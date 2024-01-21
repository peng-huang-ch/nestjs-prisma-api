import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { isEmpty } from 'lodash';
import { Strategy } from 'passport-jwt';

import { getJwtModuleOptions, jwtFromRequest } from '@src/config';

import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    const opt = getJwtModuleOptions(configService);
    super({
      jwtFromRequest: jwtFromRequest(),
      ignoreExpiration: false,
      secretOrKey: opt.secret,
    });
  }

  async validate(payload: any): Promise<any> {
    const id = payload['id'];
    if (!id) throw new UnauthorizedException();

    const user = await this.authService.getUserById(id);
    if (!user || isEmpty(user)) throw new UnauthorizedException();

    return Object.assign(user, { id });
  }
}
