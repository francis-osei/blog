import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;

  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
  };

  const usersServiceMock = {
    findByEmail: jest.fn().mockResolvedValue(mockUser),
    findById: jest.fn().mockResolvedValue(mockUser),
    authenticateUser: jest.fn().mockResolvedValue(mockUser),
    deauthenticateUser: jest.fn().mockResolvedValue(undefined),
  };

  const jwtServiceMock = {
    signAsync: jest
      .fn()
      .mockResolvedValueOnce('access_token')
      .mockResolvedValueOnce('refresh_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return user with access and refresh tokens', async () => {
      (compare as jest.Mock).mockResolvedValue(true);
      jwtServiceMock.signAsync
        .mockResolvedValueOnce('access_token')
        .mockResolvedValueOnce('refresh_token');

      const result = await authService.login({
        email: mockUser.email,
        password: 'password123',
      });

      expect(usersServiceMock.authenticateUser).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(result).toMatchObject({
        ...mockUser,
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
    });
  });

  describe('validateUser', () => {
    it('should return user if email and password match', async () => {
      (compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validatUser({
        email: mockUser.email,
        password: 'password123',
      });

      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.validatUser({ email: mockUser.email, password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens if user exists', async () => {
      jwtServiceMock.signAsync
        .mockResolvedValueOnce('new_access_token')
        .mockResolvedValueOnce('new_refresh_token');

      const result = await authService.refreshToken({
        sub: mockUser.id,
        username: mockUser.username,
      });

      expect(usersServiceMock.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersServiceMock.findById.mockResolvedValueOnce(null);

      await expect(
        authService.refreshToken({ sub: 'bad-id', username: 'nouser' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should logout user if found', async () => {
      const result = await authService.logout(mockUser.id);

      expect(usersServiceMock.findById).toHaveBeenCalledWith(mockUser.id);
      expect(usersServiceMock.deauthenticateUser).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(result).toEqual({ message: 'Logout successful' });
    });

    it('should throw NotFoundException if user not found', async () => {
      usersServiceMock.findById.mockResolvedValueOnce(null);

      await expect(authService.logout('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
