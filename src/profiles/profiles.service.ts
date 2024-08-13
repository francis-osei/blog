import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DatabaseService } from 'src/database/database.service';
import { ProfileResponse } from './types/response';

@Injectable()
export class ProfilesService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(
    createProfileDto: CreateProfileDto,
    userId: string,
  ): Promise<ProfileResponse> {
    return this.databaseService.profile.create({
      data: {
        bio: createProfileDto.bio,
        profileImage: createProfileDto.profileImage,
        userId: userId,
      },
      select: {
        id: true,
        bio: true,
        profileImage: true,
        userId: true,
        createdAt: true,
        updatedAt: false,
      },
    });
  }

  async findAll(): Promise<ProfileResponse[]> {
    const userProfiles = await this.databaseService.profile.findMany({
      where: { user: { role: 'USER' } },
    });
    return userProfiles;
  }

  async findOne(id: string): Promise<ProfileResponse> {
    const profile = await this.databaseService.profile.findUnique({
      where: { id },
    });
    return profile;
  }

  async update(
    id: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileResponse> {
    const updatedProfile = await this.databaseService.profile.update({
      where: { id },
      data: {
        bio: updateProfileDto.bio,
        profileImage: updateProfileDto.profileImage,
      },
    });

    return updatedProfile;
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
