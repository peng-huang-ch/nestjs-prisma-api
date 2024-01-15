import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { jwtFromRequest } from '@src/config';

@Injectable()
export class TokenAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = jwtFromRequest()(request);
    if (!token) return true;

    return (await super.canActivate(context)) as boolean;
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (info) throw new UnauthorizedException(info?.message);
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
