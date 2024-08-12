import { HttpStatus } from '@nestjs/common';
import { GetTokens } from 'src/auth/types/auth.types';

export type ApiResponse<T> = {
  statusCode: HttpStatus;
  message: string;
  results?: number;
  data?: T;
};

export type RefreshJwtToken = {
  statusCode: HttpStatus;
  message: string;
  tokens: GetTokens;
};
