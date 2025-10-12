import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { userReturn } from '../users/types/uses.return';
import { ApiResponse } from '../types/api.response';
import { RefreshGuard } from '../guards/refresh.guard';
import { AuthGuard } from '../guards/auth.guard';
import { AuthRequest, GetTokens } from './types/auth.types';
import {
  HttpStatus,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthLoginDto } from './dto/auth-login.dto';
import { SessionData } from 'express-session';

describe('AuthController', () => {
  let authController: AuthController;
  let usersService: UsersService;
  let authService: AuthService;

  const user = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'password@123',
  };

  const dto: CreateUserDto = {
    username: user.username,
    email: user.email,
    password: user.password,
  };

  const mockUser: userReturn = {
    id: 'user-1234',
    email: dto.email,
    username: dto.username,
    role: 'USER',
    isAuthenticated: true,
  };

  const mockTokens: GetTokens = {
    access_token: 'mockAccess',
    refresh_token: 'mockRefresh',
  };

  const mockLoginDto: AuthLoginDto = {
    email: user.email,
    password: user.password,
  };

  const mockLoginResponse = {
    id: mockUser.id,
    username: mockUser.username,
    role: mockUser.role,
    isAuthenticated: true,
    access_token: mockTokens.access_token,
    refresh_token: mockTokens.refresh_token,
  };

  const mockSessionData = {
    user: {
      userId: 'user-123',
      username: user.username,
      role: ['USER'],
      isAuthenticated: true,
    },
  } as SessionData;

  const mockUsersService = {
    create: jest.fn().mockResolvedValue(mockUser),
  };

  const mockAuthService = {
    refreshToken: jest.fn().mockResolvedValue(mockTokens),
    login: jest.fn().mockResolvedValue(mockLoginResponse),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    })
      .overrideGuard(RefreshGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    authController = module.get<AuthController>(AuthController);
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const result: ApiResponse<userReturn> =
        await authController.register(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        statusCode: 201,
        message: 'Successful',
        data: mockUser,
      });
    });

    it('should throw if UsersService.create fails', async () => {
      mockUsersService.create.mockRejectedValue(new Error('Database error'));

      await expect(authController.register(dto)).rejects.toThrow(
        'Database error',
      );
      expect(usersService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should login successfully and set session', async () => {
      const result: ApiResponse<{ user: userReturn; tokens: GetTokens }> =
        await authController.login(mockSessionData, mockLoginDto);

      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);

      expect(mockSessionData.user).toEqual({
        userId: mockLoginResponse.id,
        username: mockLoginResponse.username,
        role: [mockLoginResponse.role],
        isAuthenticated: mockLoginResponse.isAuthenticated,
      });

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: {
          user: {
            id: mockLoginResponse.id,
            username: mockLoginResponse.username,
            role: mockLoginResponse.role,
            isAuthenticated: mockLoginResponse.isAuthenticated,
          },
          tokens: {
            access_token: mockLoginResponse.access_token,
            refresh_token: mockLoginResponse.refresh_token,
          },
        },
      });
    });
  });

  describe('refresh', () => {
    it('should refrersh token successfully', async () => {
      const req = {
        user: { sub: 'user-123', username: 'john doe' },
      } as AuthRequest;

      const result: ApiResponse<GetTokens> =
        await authController.refreshToken(req);

      expect(authService.refreshToken).toHaveBeenCalledWith({
        sub: req.user.sub,
        username: req.user.username,
      });
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'successful',
        tokens: mockTokens,
      });
    });

    it('should throw UnauthorizedException if user is missing', async () => {
      const req = {} as AuthRequest;

      await expect(authController.refreshToken(req)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(authService.refreshToken).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    let mockReq;

    beforeEach(() => {
      mockReq = {
        session: {
          user: {
            userId: 'user-123',
            username: 'testuser',
            role: ['USER'],
            isAuthenticated: true,
          },
          destroy: jest.fn((callback) => callback(null)),
        },
      };

      authService.logout = jest.fn().mockResolvedValue(undefined);
    });

    it('should logout successfully', async () => {
      const result = await authController.logout(mockReq);

      expect(authService.logout).toHaveBeenCalledWith('user-123');
      expect(mockReq.session.destroy).toHaveBeenCalled();

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'successful',
      });
    });

    it('should throw UnauthorizedException if session user is missing', async () => {
      mockReq.session.user = null;

      await expect(authController.logout(mockReq)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw InternalServerErrorException if session destroy fails', async () => {
      mockReq.session.destroy = jest
        .fn()
        .mockImplementationOnce((cb) => cb(new Error('fail')));

      await expect(authController.logout(mockReq)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
