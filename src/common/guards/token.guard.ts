import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { jwtFromRequest } from '@src/config';

@Injectable()
export class TokenAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = jwtFromRequest()(request);
    if (!token) return true;

    try {
      const result = (await super.canActivate(context)) as boolean;
      return result;
    } catch (error) {
      return false;
    }
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
