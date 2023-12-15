import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

import { type Request } from 'express';
import { OAuth2Client as GoogleOAuth2Client } from 'google-auth-library';
import { pick } from 'lodash';
import assert from 'node:assert/strict';

import { getGoogleAppOptions } from '@src/config';
import { UsersManager } from '@src/services';

@Injectable()
export class AuthService {
  appleOpt: { [key: string]: any };
  googleOpt: { scope: string[]; audience: string[] };
  googleOAuth2Client: GoogleOAuth2Client;

  constructor(
    configService: ConfigService,
    private jwtService: JwtService,
    private usersMgr: UsersManager,
  ) {
    this.googleOAuth2Client = new GoogleOAuth2Client();
    this.googleOpt = getGoogleAppOptions(configService);
  }

  async validateAdmin(username: string, password: string) {
    return await this.usersMgr.isAdmin(username);
  }

  async getUserById(id: string) {
    return this.usersMgr.getUserById(id);
  }

  get getAppScope() {
    return this.googleOpt?.scope;
  }

  async getProfile(id: string) {
    const user = await this.usersMgr.getUserById(id);

    return Object.assign({ id }, pick(user, 'name', 'email', 'iconUrl', 'roles'));
  }

  async revoke(id: string) {
    await this.usersMgr.removeUserById(id);
    return true;
  }

  async googleLogin(req: Request) {
    const googleProps: any = req.user;
    const email = googleProps?.email;
    const name = googleProps?.name;
    const googleId = googleProps.googleId;
    const iconUrl = googleProps?.picture;
    if (!email || !googleId) throw new ForbiddenException('failed to login with google');

    const data = { googleId, googleProps, name, email, iconUrl };
    const where = { googleId };
    const doc = await this.usersMgr.login(where, data);
    return this.signToLogin(doc);
  }

  async googleVerifyIdToken(req: Request) {
    let payload: any;
    try {
      const options = {
        idToken: req.body.token,
        audience: this.googleOpt?.audience,
      };
      const ticket = await this.googleOAuth2Client.verifyIdToken(options);
      payload = ticket.getPayload();
    } catch (error) {
      throw new BadRequestException('invalid token');
    }

    const googleProps: any = payload;
    const googleId = payload['sub'];
    const email = googleProps?.email;
    const name = googleProps?.name;
    const iconUrl = googleProps?.picture;
    if (!email || !googleId) throw new ForbiddenException('failed to login with google');
    const data = { googleId, googleProps, name, email, iconUrl };
    const where = { googleId };
    const doc = await this.usersMgr.login(where, data);
    return this.signToLogin(doc);
  }

  async googleRevokeToken(req: Request) {
    try {
      const idToken = req.body?.token;
      await this.googleOAuth2Client.revokeToken(idToken);
    } catch (error) {
      throw new BadRequestException('invalid token');
    }
  }

  async signToLogin(doc: User) {
    const payload = { id: doc.id };
    const token = await this.jwtService.signAsync(payload);
    return {
      id: doc.id,
      token,
      name: doc.name,
      email: doc.email,
      iconUrl: doc.iconUrl,
    };
  }
}
