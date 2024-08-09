import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UsersService,
    private readonly authservice: AuthService,
  ) {}

  @Post('register')
  async register(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return {
      statusCode: 201,
      message: 'Successful',
      data: await this.userService.create(createUserDto),
    };
  }

  @Post('login')
  async login(@Body(ValidationPipe) loginDto: AuthLoginDto) {
    return {
      statusCode: 201,
      message: 'Successful',
      data: await this.authservice.login(loginDto),
    };
  }
}
