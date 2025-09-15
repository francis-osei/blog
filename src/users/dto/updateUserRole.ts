import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateUserRole {
  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(Role, {
    message: `Role must be one of: ${Object.values(Role).join(', ')}`,
  })
  @Transform(({ value }) => value?.toString().trim().toUpperCase())
  role: Role;
}
