import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { getJwtModuleOptions } from '@src/config';
import { ServicesModule } from '@src/services';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy, JwtStrategy, LocalStrategy, SessionSerializer } from './strategies';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => getJwtModuleOptions(configService),
      inject: [ConfigService],
    }),
    ServicesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, GoogleStrategy, JwtStrategy, SessionSerializer],
})
export class AuthModule {}
