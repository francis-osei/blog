import { $Enums } from '@prisma/client';

export type Login = IUser & {
  access_token: string;
  refresh_token: string;
};

export type IUser = {
  id: string;
  email?: string;
  username?: string;
  password?: string;
  role?: $Enums.Role;
};

export type GetTokens = {
  access_token: string;
  refresh_token: string;
};
