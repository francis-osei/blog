import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { JwtService } from '@nestjs/jwt';
import { GetTokens, IUser, Login } from './types/auth.types';
import { _env } from 'src/configs/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(authLoginDto: AuthLoginDto): Promise<Login> {
    const user = await this.validatUser(authLoginDto);

    const payload = { sub: user.id, username: user.username };

    const { access_token, refresh_token } = await this.getTokens(payload);

    return {
      ...user,
      access_token,
      refresh_token,
    };
  }

  private async getTokens(payload: {
    sub: string;
    username: string;
  }): Promise<GetTokens> {
    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: _env.ACCESS_TOKEN_EXPIRY,
        secret: process.env.JWT_SECRET_KEY,
      }),
      refresh_token: await this.jwtService.signAsync(payload, {
        expiresIn: _env.REFRESH_TOKEN_EXPIRY,
        secret: process.env.JWT_REFRESH_TOKEN_KEY,
      }),
    };
  }

  async validatUser(userDto: AuthLoginDto): Promise<IUser> {
    const user = await this.usersService.findByEmail(userDto.email);

    if (!user || !(await compare(userDto.password, user.password))) {
      throw new UnauthorizedException();
    }

    const userDataWithoutPassword = { ...user };
    delete userDataWithoutPassword.password;

    return userDataWithoutPassword;
  }

  async refreshToken(payloadDto: {
    sub: string;
    username: string;
  }): Promise<GetTokens> {
    const payload = { sub: payloadDto.sub, username: payloadDto.username };

    return await this.getTokens(payload);
  }
}
