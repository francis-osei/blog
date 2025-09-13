import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof BadRequestException) {
      const validationErrors = exception.getResponse();
      return response.status(HttpStatus.BAD_REQUEST).json({
        message: validationErrors,
      });
    }

    const responseBody = {
      statusCode: httpStatus,
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message:
        exception instanceof HttpException
          ? exception.message
          : 'Internal server error',
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
