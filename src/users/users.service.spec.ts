import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '../database/database.service';
import { userReturn } from './types/uses.return';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException } from '@nestjs/common';
import { hash } from 'bcrypt';

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
              findById: jest.fn(),
              authenticateUser: jest.fn(),
              deauthenticateUser: jest.fn(),
              getuser: jest.fn(),
              findAll: jest.fn(),
              findOne: jest.fn(),
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
});
