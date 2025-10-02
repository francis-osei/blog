import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { ApiResponse } from '../types/api.response';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { userReturn } from '../users/types/uses.return';
import { HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let userService: UsersService;

  const dto: CreateUserDto = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'password123',
  };

  const mockUser = {
    id: 'user-1234',
    email: dto.email,
    username: dto.username,
    role: 'USER',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UsersService,
          useValue: { user: { create: jest.fn().mockResolvedValue(mockUser) } },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    userService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const result: ApiResponse<userReturn> =
        await authController.register(dto);

      expect(userService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Successful',
        data: mockUser,
      });
    });
  });
});
