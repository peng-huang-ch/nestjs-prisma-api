import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, PrismaClient, User } from '@prisma/client';

import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { PrismaService } from '@src/prisma';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  let prismaService: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // imports: [PrismaModule],
      providers: [UsersService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create one', async () => {
    const user = {
      id: 'id',
      name: 'name',
      email: 'email',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as User;
    prismaService.user.create.mockResolvedValue(user);
    await expect(service.create(user as Prisma.UserCreateInput)).resolves.toBe(user);
    expect(service).toBeDefined();
  });
});
