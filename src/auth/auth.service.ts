import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { compare } from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(authLoginDto: AuthLoginDto) {
    const user = await this.validatUser(authLoginDto);

    const payload = { sub: user.id, username: user.username };

    return {
      user,
      tokens: {
        access_token: await this.jwtService.signAsync(payload, {
          expiresIn: '1h',
          secret: process.env.JWT_SECRET_KEY,
        }),
        refresh_token: await this.jwtService.signAsync(payload, {
          expiresIn: '7d',
          secret: process.env.JWT_REFRESH_TOKEN_KEY,
        }),
      },
    };
  }

  async validatUser(userDto: AuthLoginDto): Promise<User> {
    const user = await this.usersService.findByEmail(userDto.email);

    if (!user || !(await compare(userDto.password, user.password))) {
      throw new UnauthorizedException();
    }

    const userDataWithoutPassword = { ...user };
    delete userDataWithoutPassword.password;

    return user;
  }
}
