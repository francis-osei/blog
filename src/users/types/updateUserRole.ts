import { Role } from '@prisma/client';

export type UpateUserRole = {
  id: string;
  email: string;
  role: Role;
};
