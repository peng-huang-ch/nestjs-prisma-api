import { Expose, plainToInstance, Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @Expose()
  @IsString()
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @Expose()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  HTTP_PORT: number;

  @Expose()
  @IsBoolean()
  @Transform(({ value }) => {
    return [true, 'enabled', 'true'].indexOf(value) > -1;
  })
  LOG_PRETTY: boolean;

  @Expose()
  @IsString()
  OTLP_SERVICE_NAME: string;

  @Expose()
  @IsString()
  LOG_LOKI: string;

  @Expose()
  @IsString()
  LOG_LEVEL: string;

  @Expose()
  @IsString()
  LOG_FILE: string;

  @Expose()
  @IsString()
  DATABASE_URL: string;

  @Expose()
  @IsString()
  REDIS_URL: string;

  @Expose()
  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_ID: string;

  @Expose()
  @IsString()
  @IsOptional()
  GOOGLE_SECRET: string;

  @Expose()
  @IsString()
  @IsOptional()
  GOOGLE_CALLBACK: string;

  @Expose()
  @IsString()
  @IsOptional()
  GOOGLE_SCOPE: string;

  @Expose()
  @IsString()
  @IsOptional()
  APPLE_CLIENT_ID: string;

  @Expose()
  @IsString()
  @IsOptional()
  APPLE_TEAM_ID: string;

  @Expose()
  @IsString()
  @IsOptional()
  APPLE_KEY_IDENTIFIER: string;

  @Expose()
  @IsString()
  @IsOptional()
  APPLE_PRIVATE_KEY_PATH: string;

  @Expose()
  @IsString()
  @IsOptional()
  GOOGLE_AUDIENCE: string;

  @Expose()
  @IsString()
  @IsOptional()
  JWT_SECRET_KEY: string;

  @Expose()
  @IsString()
  @IsOptional()
  JWT_EXPIRE_IN: string;
}

export function validate(config: Record<string, string>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    excludeExtraneousValues: true,
    exposeUnsetFields: false,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
