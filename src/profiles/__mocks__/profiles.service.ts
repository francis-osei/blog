import { ProfileStub, updatedProfileStub } from '../test/stubs/profilesStubs';

export const ProfilesService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(ProfileStub),
  findAll: jest.fn().mockResolvedValue([ProfileStub]),
  findOne: jest.fn().mockResolvedValue(ProfileStub),
  update: jest.fn().mockResolvedValue(updatedProfileStub),
});
