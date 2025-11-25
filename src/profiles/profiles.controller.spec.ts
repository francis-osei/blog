import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { Request } from 'express';
import { HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/roles.guard';
import {
  createProfileDtoStub,
  ProfileStub,
  updatedProfileStub,
  updateProfileDtoStub,
} from './test/stubs/profilesStubs';

jest.mock('./profiles.service');

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let profileService: ProfilesService;

  const dto = createProfileDtoStub();
  const mockProfile = ProfileStub();
  const updateDto = updateProfileDtoStub();
  const updatedProfile = updatedProfileStub();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [ProfilesService],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ProfilesController>(ProfilesController);
    profileService = module.get<ProfilesService>(ProfilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new profile successfully', async () => {
      const req = {
        session: {
          user: {
            userId: 'user-1234',
          },
        },
      } as Request;

      jest.spyOn(profileService, 'create').mockResolvedValueOnce(mockProfile);

      const { userId } = req.session.user;
      const result = await controller.create(req, dto);

      expect(profileService.create).toHaveBeenCalledWith(dto, userId);
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'successful',
        data: mockProfile,
      });
    });
  });

  describe('findAll', () => {
    it('should return all profules successfully', async () => {
      jest
        .spyOn(profileService, 'findAll')
        .mockResolvedValueOnce([mockProfile]);

      const result = await controller.findAll();

      expect(profileService.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Successful',
        results: [mockProfile].length,
        data: [mockProfile],
      });
    });
  });

  describe('findOne', () => {
    it('should return the profile for the given ID', async () => {
      const id = 'profile-123';

      jest.spyOn(profileService, 'findOne').mockResolvedValueOnce(mockProfile);

      const result = await controller.findOne(id);

      expect(profileService.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: mockProfile,
      });
    });
    it('should throw an error if profile is not found', async () => {
      jest
        .spyOn(profileService, 'findOne')
        .mockRejectedValueOnce(new Error('Profile not found'));

      const id = 'invalid-id';

      await expect(controller.findOne(id)).rejects.toThrow('Profile not found');
      expect(profileService.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should return updated profile data when successful', async () => {
      const id = mockProfile.id;

      jest
        .spyOn(profileService, 'update')
        .mockResolvedValueOnce(updatedProfile);

      const result = await controller.update(id, updateDto);

      expect(profileService.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: updatedProfile,
      });
    });

    it('should throw an error if update fails', async () => {
      const id = 'invalid-id';

      jest
        .spyOn(profileService, 'update')
        .mockRejectedValueOnce(new Error('Profile not found'));

      await expect(controller.update(id, updateDto)).rejects.toThrow(
        'Profile not found',
      );

      expect(profileService.update).toHaveBeenCalledWith(id, updateDto);
    });
  });
});
