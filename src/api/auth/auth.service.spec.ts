import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

import { getJwtModuleOptions } from '@src/config';
import { UsersManager } from '@src/services';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

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
      providers: [
        AuthService,
        {
          provide: UsersManager,
          useValue: createMock<UsersManager>({}),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
