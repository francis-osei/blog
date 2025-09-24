import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { userReturn } from './types/uses.return';
import { CanActivate, ForbiddenException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/roles.guard';
import { Role } from '@prisma/client';
import { UpdateUserRole } from './dto/updateUserRole';

describe('UsersController', () => {
  let controller: UsersController;
  let userService: UsersService;

  const mockUser: userReturn = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedPassword',
    role: 'USER',
    isAuthenticated: false,
  };

  const mockUpdateUserRole = {
    id: mockUser.id,
    email: mockUser.email,
    role: mockUser.role,
  };

  const mockDto = { role: Role.AUTHOR };

  class MockAuthGuard implements CanActivate {
    canActivate(): boolean {
      return true;
    }
  }

  class MockRoleGuard implements CanActivate {
    canActivate(): boolean {
      return true;
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUser),
            updateRole: jest.fn().mockResolvedValue(mockUpdateUserRole),
            remove: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .overrideGuard(RoleGuard)
      .useClass(MockRoleGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    userService = module.get<UsersService>(UsersService);
  });

  describe('findOne', () => {
    it('should return ApiResponse wht user data when found', async () => {
      (userService.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.findOne(mockUser.id);

      expect(userService.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: mockUser,
      });
    });
  });

  describe('UpdateOwnerRole', () => {
    it('shoutl update the user role successfully', async () => {
      const req = { session: { user: { userId: mockUser.id } } } as never;

      const result = await controller.updateOwnerRole(mockDto, req);

      expect(userService.updateRole).toHaveBeenCalledWith(mockUser.id, mockDto);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: mockUpdateUserRole,
      });
    });

    it('should throw ForbiddenException if user tries to assign ADMIN role', async () => {
      const req = { session: { user: { userId: mockUser.id } } } as never;
      const dto = { role: Role.ADMIN };

      await expect(controller.updateOwnerRole(dto, req)).rejects.toThrow(
        ForbiddenException,
      );
      expect(userService.updateRole).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete user and return ApiResponse', async () => {
      const userId = mockUser.id;

      const result = await controller.remove(userId);

      expect(userService.remove).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Successful',
        data: mockUser,
      });
    });
  });

  describe('updateUserRole', () => {
    it('should throw ForbiddenException if user tries to change their own role', async () => {
      const req = { session: { user: { userId: '123' } } } as never;
      const dto: UpdateUserRole = { role: 'ADMIN' };

      await expect(controller.updateUserRole(req, '123', dto)).rejects.toThrow(
        ForbiddenException,
      );

      expect(userService.updateRole).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user tries to change their own role', async () => {
      const req = { session: { user: { userId: '123' } } } as never;
      const dto: UpdateUserRole = { role: 'ADMIN' };

      await expect(controller.updateUserRole(req, '123', dto)).rejects.toThrow(
        ForbiddenException,
      );

      expect(userService.updateRole).not.toHaveBeenCalled();
    });
  });
});
