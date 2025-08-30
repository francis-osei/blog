import { Role } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateUserRole {
  @IsEnum(Role, { message: 'Role must be USER ADMIN or AUTHOR' })
  role: Role;
}
