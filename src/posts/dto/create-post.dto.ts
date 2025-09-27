import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsUrl,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(150)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  content: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  summary?: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl({}, { message: 'coverImage must be a valid URL' })
  coverImage: string;
}
