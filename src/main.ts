import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import Redis from 'ioredis';
import helmet from 'helmet';
import { HttpExceptionFilter } from './exception-filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './exception-filters/all-exceptions.filter';
import { PrismaExceptionFilter } from './exception-filters/prisma-exceptions.filter';
import { createCorsOptions } from './config/cors.config';

async function bootstrap(): Promise<void> {
  const RedisStore = connectRedis(session);
  const redisClient = new Redis();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT');
  const httpAdapterHost = app.get(HttpAdapterHost);

  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(
    new HttpExceptionFilter(configService),
    new AllExceptionsFilter(httpAdapterHost),
    new PrismaExceptionFilter(),
  );

  app.use(helmet());

  app.enableCors(createCorsOptions(configService));

  app.set('trust proxy', 1);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const sessionMiddleware = session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: process.env.NODE_ENV === 'production' ? true : false,
      secure: process.env.NODE_ENV === 'production' ? true : false,
    },
  });

  app.use(sessionMiddleware);

  await app.listen(PORT);
}

bootstrap();
