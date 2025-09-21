import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '../database/database.service';
import { userReturn } from './types/uses.return';
import { CreateUserDto } from './dto/create-user.dto';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import { UpdateUserRole } from './dto/updateUserRole';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let db: jest.Mocked<DatabaseService>;

  const dto: CreateUserDto = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'password123',
  };

  const mockUser: userReturn = {
    id: 'user-id',
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'password123',
    role: 'USER',
    isAuthenticated: false,
  };
  const mockUsers: userReturn[] = [mockUser];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              findByEmail: jest.fn(),
              update: jest.fn(),
              findById: jest.fn(),
              getuser: jest.fn(),
              delete: jest.fn(),
              findAll: jest.fn(),
              findOne: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    db = module.get(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user if email does not exist', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);
      (db.user.create as jest.Mock).mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        role: mockUser.role,
      });

      const result = await service.create(dto);

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(hash).toHaveBeenCalledWith(dto.password, 10);
      expect(db.user.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          password: 'hashed-password',
        },
        select: {
          id: true,
          email: true,
          username: true,
          password: false,
          role: true,
        },
      });
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        role: mockUser.role,
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.create(dto)).rejects.toThrow(
        new ConflictException('Cannot have duplicate emails'),
      );
      expect(db.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return user when found by email', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email },
        select: {
          id: true,
          username: true,
          email: true,
          password: true,
          role: true,
          isAuthenticated: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by email', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findByEmail('missing@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user when found by id', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findById('123');

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        select: {
          id: true,
          username: true,
          email: true,
          password: true,
          role: true,
          isAuthenticated: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by id', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('authenticateUser', () => {
    it('should update user isAuthenticated to true', async () => {
      (db.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.authenticateUser('user-id');

      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { isAuthenticated: true },
        select: {
          id: true,
          email: true,
          username: true,
          password: false,
          role: true,
          isAuthenticated: true,
        },
      });

      expect(result).toEqual(mockUser);
    });
  });

  describe('deauthenticateUser', () => {
    it('should set isAuthenticated to false', async () => {
      await service.deauthenticateUser('user-id');

      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { isAuthenticated: false },
      });

      expect(db.user.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUser', () => {
    it('should throw BadRequestException if no identifier is provided', async () => {
      await expect(service['getuser']('')).rejects.toThrow(
        new BadRequestException('A valid user identifier is required'),
      );

      expect(db.user.findUnique).not.toHaveBeenCalled();
    });

    it('should call findUnique with email when identifier is an email', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service['getuser']('test@example.com');

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: {
          id: true,
          email: true,
          username: true,
          password: true,
          role: true,
          isAuthenticated: true,
        },
      });

      expect(result).toEqual(mockUser);
    });

    it('should call findUnique with id when identifier is not an email', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service['getuser']('user-id');

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        select: {
          id: true,
          email: true,
          username: true,
          password: true,
          role: true,
          isAuthenticated: true,
        },
      });

      expect(result).toEqual(mockUser);
    });

    it('should return null when no user is found', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service['getuser']('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return paginated users and total count', async () => {
      (db.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (db.user.count as jest.Mock).mockResolvedValue(2);

      const result = await service.findAll(1, 10);

      expect(db.user.findMany).toHaveBeenCalledWith({
        where: { role: 'USER' },
        skip: 0,
        take: 10,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isAuthenticated: true,
        },
      });

      expect(db.user.count).toHaveBeenCalledWith({
        where: { role: 'USER' },
      });

      expect(result).toEqual({
        data: mockUsers,
        total: 2,
      });
    });

    it('should calculate skip correctly for custom page and limit', async () => {
      (db.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (db.user.count as jest.Mock).mockResolvedValue(2);

      const result = await service.findAll(2, 5);

      expect(db.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );

      expect(result).toEqual({
        data: mockUsers,
        total: 2,
      });
    });
  });

  describe('findOne', () => {
    it('should throw BadRequestException if no id is provided', async () => {
      await expect(service.findOne('')).rejects.toThrow(
        new BadRequestException('A valid user ID must be provided'),
      );
    });

    it('should return a user if found', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: {
          id: true,
          email: true,
          username: true,
          password: false,
          role: true,
          isAuthenticated: true,
        },
      });

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });

  describe('updateRole', () => {
    const userId = mockUser.id;
    const dto: UpdateUserRole = { role: mockUser.role };

    it('should throw BadRequestException if userId is missing', async () => {
      await expect(service.updateRole('', dto)).rejects.toThrow(
        new BadRequestException('A valid user ID is required'),
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updateRole(userId, dto)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });

    it('should update and return user role when user exists', async () => {
      const updatedUser = {
        id: userId,
        email: mockUser.email,
        role: mockUser.role,
      };

      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (db.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.updateRole(userId, dto);

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });

      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { role: dto.role },
        select: { id: true, email: true, role: true },
      });

      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should throw BadRequestException if id is missing', async () => {
      await expect(service.remove('')).rejects.toThrow(
        new BadRequestException('User ID must be provided'),
      );
    });

    it('should throw BadRequestException if user not found', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove(mockUser.id)).rejects.toThrow(
        new BadRequestException('User not found'),
      );
    });

    it('should delete and return user when user exists', async () => {
      const deletedUser = { id: mockUser.id, isAuthenticated: true };

      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (db.user.delete as jest.Mock).mockResolvedValue(deletedUser);

      const result = await service.remove(mockUser.id);

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });

      expect(db.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: {
          id: true,
          email: false,
          username: false,
          password: false,
          role: false,
          isAuthenticated: true,
        },
      });

      expect(result).toEqual(deletedUser);
    });
  });
});
