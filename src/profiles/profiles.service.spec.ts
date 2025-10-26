import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { DatabaseService } from '../database/database.service';
import { ProfileReturn } from './types/profiles.response';
import { CreateProfileDto } from './dto/create-profile.dto';
import { describe } from 'node:test';
import { NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let db: DatabaseService;

  const mockProfile: ProfileReturn = {
    id: '12345',
    profileImage: 'https://example.com/avatar.jpg',
    bio: 'Software developer passionate about clean code and design.',
    userId: 'user_6789',
    createdAt: new Date('2025-01-01T10:00:00Z'),
    updatedAt: new Date('2025-02-01T12:00:00Z'),
  };

  const mockUpdatedProfile: ProfileReturn = {
    id: mockProfile.id,
    profileImage: 'https://example.com/new-avatar.jpg',
    bio: 'Updated bio',
    userId: mockProfile.userId,
    createdAt: mockProfile.createdAt,
    updatedAt: mockProfile.updatedAt,
  };

  const mockProfiles: ProfileReturn[] = [mockProfile];

  const mockUserId = mockProfile.userId;

  const mockDto: CreateProfileDto = {
    profileImage: mockProfile.profileImage,
    bio: mockProfile.bio,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: DatabaseService,
          useValue: {
            profile: {
              create: jest.fn().mockResolvedValue(mockProfile),
              findMany: jest.fn().mockResolvedValue(mockProfiles),
              findUnique: jest.fn().mockResolvedValue(mockProfile),
              findOne: jest.fn().mockResolvedValue(mockProfile),
              update: jest.fn().mockResolvedValue(mockUpdatedProfile),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    db = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a profile successfully', async () => {
      const result = await service.create(mockDto, mockUserId);

      expect(db.profile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          bio: mockProfile.bio,
          profileImage: mockProfile.profileImage,
          userId: mockProfile.userId,
        }),
        select: expect.objectContaining({
          id: true,
          bio: true,
          profileImage: true,
          userId: true,
          createdAt: true,
          updatedAt: false,
        }),
      });

      expect(result).toEqual(mockProfile);
    });
  });

  describe('findAll', () => {
    it('should return all user profiles with role USER', async () => {
      const result = await service.findAll();

      expect(db.profile.findMany).toHaveBeenCalledWith({
        where: { user: { role: 'USER' } },
      });

      expect(result).toEqual(mockProfiles);
    });
  });

  describe('findOne', () => {
    it('should return a profile if found', async () => {
      const result = await service.findOne(mockProfile.id);

      expect(db.profile.findUnique).toHaveBeenCalledWith({
        where: { id: mockProfile.id },
      });
      expect(result).toEqual(mockProfile);
    });

    it('should throw NotFoundException if no profile is found', async () => {
      const mockProfileId = 'nonexistent';
      (db.profile.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(mockProfileId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(mockProfileId)).rejects.toThrow(
        `Profile with ID "${mockProfileId}" not found`,
      );

      expect(db.profile.findUnique).toHaveBeenCalledWith({
        where: { id: mockProfileId },
      });
    });
  });

  describe('update', () => {
    const mockUpdateDto: UpdateProfileDto = {
      bio: 'Updated bio',
      profileImage: 'https://example.com/new-avatar.jpg',
    };

    it('should update and return the updated profile', async () => {
      const result = await service.update(mockProfile.id, mockUpdateDto);

      expect(db.profile.update).toHaveBeenCalledWith({
        where: { id: mockProfile.id },
        data: {
          bio: mockUpdatedProfile.bio,
          profileImage: mockUpdatedProfile.profileImage,
        },
      });
      expect(result).toEqual(mockUpdatedProfile);
    });

    it('should throw NotFoundException if profile does not exist', async () => {
      (db.profile.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', mockUpdateDto),
      ).rejects.toThrow(NotFoundException);

      await expect(
        service.update('nonexistent-id', mockUpdateDto),
      ).rejects.toThrow('Profile with ID "nonexistent-id" not found.');

      expect(db.profile.update).not.toHaveBeenCalled();
    });
  });
});
