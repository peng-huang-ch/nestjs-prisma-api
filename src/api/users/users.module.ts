import { Module } from '@nestjs/common';

import { ServicesModule } from '@src/services';

import { UsersController } from './users.controller';

@Module({
  imports: [ServicesModule],
  controllers: [UsersController],
})
export class UsersModule {}
