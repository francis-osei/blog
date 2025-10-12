import { $Enums } from '@prisma/client';

export type Login = IUser & {
  access_token: string;
  refresh_token: string;
};

export type IUser = {
  id: string;
  isAuthenticated?: boolean;
  email?: string;
  username?: string;
  password?: string;
  role?: $Enums.Role;
};

export type GetTokens = {
  access_token: string;
  refresh_token: string;
};

export type JwtPayload = {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
};

export type AuthRequest = Request & { user?: JwtPayload };
