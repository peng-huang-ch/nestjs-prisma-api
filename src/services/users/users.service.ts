import { Injectable } from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';

import { PrismaService } from '@src/prisma';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
    });
  }

  async createMany(inputs: Prisma.UserCreateInput[]) {
    const ops = inputs.map((input) => {
      const { email, ...item } = input;
      return this.prisma.user.upsert({
        where: { email },
        update: item,
        create: input,
      });
    });
    return await this.prisma.$transaction(ops);
  }

  async exists(where: Prisma.UserWhereInput): Promise<boolean> {
    const doc = await this.prisma.user.findFirst({
      where,
      select: { id: true },
    });
    return !!doc;
  }

  async findFirst(params: { skip?: number; take?: number; cursor?: Prisma.UserWhereUniqueInput; where?: Prisma.UserWhereInput; orderBy?: Prisma.UserOrderByWithRelationInput }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findFirst({ skip, take, cursor, where, orderBy });
  }

  async findMany(params: { skip?: number; take?: number; cursor?: Prisma.UserWhereUniqueInput; where?: Prisma.UserWhereInput; orderBy?: Prisma.UserOrderByWithRelationInput }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({ skip, take, cursor, where, orderBy });
  }

  async paginate(params: {
    page?: number;
    perPage?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput; // where
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { where, page = 1, perPage = 10, orderBy = { id: 'desc' } } = params;

    const [data, meta] = await this.prisma.pagination.user
      .paginate({
        where,
        orderBy,
      })
      .withPages({
        limit: perPage,
        page,
        includePageCount: true,
      });
    return { meta, data };
  }

  async upsert(args: Prisma.UserUpsertArgs): Promise<User> {
    return this.prisma.user.upsert(args);
  }

  async update(params: { where: Prisma.UserWhereUniqueInput; data: Prisma.UserUpdateInput }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      where,
      data,
    });
  }

  async updateMany(params: { where: Prisma.UserWhereUniqueInput; data: Prisma.UserUpdateInput }): Promise<Prisma.BatchPayload> {
    const { where, data } = params;
    return this.prisma.user.updateMany({
      where,
      data,
    });
  }

  async delete(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  async deleteMany(where: Prisma.UserWhereInput): Promise<Prisma.BatchPayload> {
    return this.prisma.user.deleteMany({
      where,
    });
  }
}
