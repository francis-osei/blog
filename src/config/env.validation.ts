import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsNotEmpty()
  @IsNumber()
  PORT: number;

  @IsNotEmpty()
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
