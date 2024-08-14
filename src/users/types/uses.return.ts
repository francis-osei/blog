import { $Enums } from '@prisma/client';

export type userReturn = {
  id: string;
  email?: string;
  username?: string;
  password?: string;
  role?: $Enums.Role;
};
