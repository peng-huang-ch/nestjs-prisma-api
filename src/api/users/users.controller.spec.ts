import { CacheModule } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';

import { TraceService } from 'nestjs-otel';

import { PrismaModule, PrismaService } from '@src/prisma';
import { UsersManager, UsersService } from '@src/services';

import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register(), PrismaModule],
      providers: [UsersManager, UsersService, PrismaService, TraceService],
      controllers: [UsersController],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
