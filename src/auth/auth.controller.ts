import {
  Body,
  Controller,
  Post,
  Request,
  Session,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { SessionData } from 'express-session';
import { RefreshGuard } from 'src/guards/refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UsersService,
    private readonly authservice: AuthService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return {
      statusCode: 201,
      message: 'Successful',
      data: await this.userService.create(createUserDto),
    };
  }

  @Post('login')
  async login(@Session() session: SessionData, @Body() loginDto: AuthLoginDto) {
    const user = await this.authservice.login(loginDto);

    session.user = {
      userId: user.user.id,
      username: user.user.username,
      role: [user.user.role],
    };

    return {
      statusCode: 201,
      message: 'Successful',
      data: user,
    };
  }

  @UseGuards(RefreshGuard)
  @Post('refresh')
  async refreshToken(@Request() req) {
    const tokens = await this.authservice.refreshToken(req.user);

    return {
      statusCode: 201,
      message: 'successful',
      ...tokens,
    };
  }
}
