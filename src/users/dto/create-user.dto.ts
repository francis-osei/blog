import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @MaxLength(20, { message: 'Username must not exceed 20 characters' })
  @Transform(({ value }) => value.trim())
  username: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(16, { message: 'Password must not exceed 16 characters' })
  password: string;
}
