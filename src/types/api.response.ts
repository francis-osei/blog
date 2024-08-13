import { HttpStatus } from '@nestjs/common';

export type ApiResponse<T> = {
  statusCode: HttpStatus;
  message: string;
  results?: number;
  tokens?: T;
  data?: T | null;
};
