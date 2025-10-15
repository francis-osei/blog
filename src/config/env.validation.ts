import { plainToInstance, Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator';

enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}
export class EnvironmentVariables {
  @IsNotEmpty()
  @IsNumber()
  PORT: number;

  @IsEnum(Environment)
  @IsString()
  NODE_ENV: string;

  @IsNotEmpty()
  @IsString()
  DATABASE_URL: string;

  @IsNotEmpty()
  @IsString()
  SESSION_SECRET_KEY: string;

  @IsNotEmpty()
  @IsString()
  JWT_SECRET_KEY: string;

  @IsNotEmpty()
  @IsString()
  JWT_REFRESH_TOKEN_KEY: string;

  @IsNotEmpty()
  @IsNumber()
  ACCESS_TOKEN_EXPIRY: number;

  @IsNotEmpty()
  @IsString()
  REFRESH_TOKEN_EXPIRY: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((v) => v.trim()) : value,
  )
  ALLOWED_ORIGINS: string[];
}

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const error = validateSync(validatedConfig, { skipMissingProperties: false });

  if (error.length > 0) {
    throw new Error(error.toString());
  }

  return validatedConfig;
}
