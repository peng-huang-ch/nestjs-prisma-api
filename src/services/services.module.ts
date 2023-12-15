import { Module } from '@nestjs/common';

import { PrismaModule } from '@src/prisma';

import { UsersManager, UsersService } from './users';

@Module({
  imports: [PrismaModule],
  providers: [UsersManager, UsersService],
  exports: [UsersManager],
})
export class ServicesModule {}
