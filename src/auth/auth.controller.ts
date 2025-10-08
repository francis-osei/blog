import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  Session,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { SessionData } from 'express-session';
import { RefreshGuard } from '../guards/refresh.guard';
import { ApiResponse } from '../types/api.response';
import { userReturn } from 'src/users/types/uses.return';
import { GetTokens } from './types/auth.types';
import { AuthGuard } from '../guards/auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UsersService,
    private readonly authservice: AuthService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponse<userReturn>> {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Successful',
      data: await this.userService.create(createUserDto),
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Session() session: SessionData,
    @Body() loginDto: AuthLoginDto,
  ): Promise<ApiResponse<{ user: userReturn; tokens: GetTokens }>> {
    const { access_token, refresh_token, ...user } =
      await this.authservice.login(loginDto);

    session.user = {
      userId: user.id,
      username: user.username,
      role: [user.role],
      isAuthenticated: user.isAuthenticated,
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
  async refreshToken(@Req() req: Request): Promise<ApiResponse<GetTokens>> {
    if (!req.user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.authservice.refreshToken({
      sub: req.user.userId,
      username: req.user.username,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'successful',
      tokens,
    };
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Req() req: Request): Promise<ApiResponse<null>> {
    const user = req.session?.user;
    if (!user?.userId) {
      throw new UnauthorizedException('User session not found');
    }

    req.session.destroy((err) => {
      if (err) {
        throw new InternalServerErrorException('Failed to log out');
      }
    });

    await this.authservice.logout(user.userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'successful',
    };
  }
}
