import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { EnvironmentVariables } from './env.validation';
import { ConfigService } from '@nestjs/config';

export function createCorsOptions(
  env: ConfigService<EnvironmentVariables>,
): CorsOptions {
  const allowedOrigins = env.get<string[]>('ALLOWED_ORIGINS') ?? [];
  return {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ): void => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
  };
}
