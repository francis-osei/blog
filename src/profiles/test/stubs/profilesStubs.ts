import { CreateProfileDto } from 'src/profiles/dto/create-profile.dto';
import { UpdateProfileDto } from 'src/profiles/dto/update-profile.dto';
import { ProfileReturn } from 'src/profiles/types/profiles.response';

export const createProfileDtoStub = (): CreateProfileDto => {
  return {
    profileImage: 'https://example.com/avatar.jpg',
    bio: 'Software developer passionate about clean code and design.',
  };
};

export const ProfileStub = (): ProfileReturn => {
  return {
    id: '12345',
    profileImage: 'https://example.com/avatar.jpg',
    bio: 'Software developer passionate about clean code and design.',
    userId: 'user_6789',
    createdAt: new Date('2025-01-01T10:00:00Z'),
    updatedAt: new Date('2025-02-01T12:00:00Z'),
  };
};

export const updateProfileDtoStub = (): UpdateProfileDto => {
  return {
    bio: 'Updated bio for testing',
    profileImage: 'https://example.com/avatar.jpg',
  };
};

export const updatedProfileStub = (): ProfileReturn => {
  return {
    ...ProfileStub(),
    bio: 'Updated bio for testing',
    profileImage: 'https://example.com/avatar.jpg',
  };
};
