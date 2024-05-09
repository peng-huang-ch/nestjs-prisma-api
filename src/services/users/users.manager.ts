import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { Cache } from 'cache-manager';
import { isEmpty, omit } from 'lodash';
import { OtelMethodCounter, Span } from 'nestjs-otel';

import { Role } from '@src/common';

import { UsersService } from './users.service';

@Injectable()
export class UsersManager {
  constructor(
    @Inject(CACHE_MANAGER) readonly cacheManager: Cache,
    readonly usersSvc: UsersService,
  ) {}

  private getUserIdCacheKey(userId: string) {
    return `users_id_${userId}`;
  }

  async isAdmin(email: string): Promise<User | null> {
    const where = { email, roles: { has: Role.Admin } };
    return await this.usersSvc.findFirst({ where });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const where = { email };
    return await this.usersSvc.findFirst({ where });
  }

  async getUserById(userId: string): Promise<User> {
    const key = this.getUserIdCacheKey(userId);
    return this.cacheManager.wrap<User>(
      key,
      async () => {
        const where = { id: userId };
        const user = await this.usersSvc.findFirst({ where });
        return Object.assign({}, user);
      },
      (value) => (!isEmpty(value) ? 60 * 60 * 1000 : 3 * 1000),
    );
  }

  @Span()
  @OtelMethodCounter()
  async removeUserById(userId: string): Promise<User> {
    const key = this.getUserIdCacheKey(userId);
    const where = { id: userId };
    const removed = await this.usersSvc.delete(where);
    await this.cacheManager.del(key);
    return removed;
  }

  @Span()
  @OtelMethodCounter()
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return await this.usersSvc.create(data);
  }

  @Span()
  @OtelMethodCounter()
  async updateUserById(userId: string, doc: Prisma.UserUpdateInput): Promise<User> {
    const key = this.getUserIdCacheKey(userId);
    const where = { id: userId };
    const user = await this.usersSvc.update({ where, data: doc });
    this.cacheManager.del(key);
    return user;
  }

  async login(where: Prisma.UserWhereUniqueInput, data: Prisma.UserCreateInput): Promise<User> {
    const update = omit(data, ['name', 'email', 'iconUrl']);
    const args = { where, update, create: data };
    const doc = await this.usersSvc.upsert(args);
    const key = this.getUserIdCacheKey(doc.id);
    await this.cacheManager.del(key);
    return doc;
  }
}
