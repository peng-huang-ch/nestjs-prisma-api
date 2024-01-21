import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

import { getJwtModuleOptions } from '@src/config';
import { UsersManager } from '@src/services';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        JwtModule.registerAsync({
          global: true,
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => getJwtModuleOptions(configService),
          inject: [ConfigService],
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: UsersManager,
          useValue: createMock<UsersManager>({}),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
