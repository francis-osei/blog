import { HttpStatus } from '@nestjs/common';

export type ApiResponse<T> = {
  statusCode: HttpStatus;
  message: string;
  results?: number;
  tokens?: T;
  total?: number;
  page?: number;
  limit?: number;
  data?: T | null;
};
