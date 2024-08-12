import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
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
import { ApiResponse, RefreshJwtToken } from 'src/types/response';
import { GetTokens, IUser } from './types/auth.types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UsersService,
    private readonly authservice: AuthService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponse<IUser>> {
    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      data: await this.userService.create(createUserDto),
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Session() session: SessionData,
    @Body() loginDto: AuthLoginDto,
  ): Promise<ApiResponse<{ user: IUser; tokens: GetTokens }>> {
    const { access_token, refresh_token, ...user } =
      await this.authservice.login(loginDto);

    session.user = {
      userId: user.id,
      username: user.username,
      role: [user.role],
    };

    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      data: {
        user,
        tokens: { access_token, refresh_token },
      },
    };
  }

  @UseGuards(RefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshToken(@Request() req): Promise<RefreshJwtToken> {
    return {
      statusCode: HttpStatus.OK,
      message: 'successful',
      tokens: await this.authservice.refreshToken(req.user),
    };
  }
}
