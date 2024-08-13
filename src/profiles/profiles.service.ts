import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DatabaseService } from 'src/database/database.service';
import { ProfileReturn } from './types/profiles.response';

@Injectable()
export class ProfilesService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(
    createProfileDto: CreateProfileDto,
    userId: string,
  ): Promise<ProfileReturn> {
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

  async findAll(): Promise<ProfileReturn[]> {
    return await this.databaseService.profile.findMany({
      where: { user: { role: 'USER' } },
    });
  }

  async findOne(id: string): Promise<ProfileReturn> {
    return await this.databaseService.profile.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileReturn> {
    const updatedProfile = await this.databaseService.profile.update({
      where: { id },
      data: {
        bio: updateProfileDto.bio,
        profileImage: updateProfileDto.profileImage,
      },
    });

    return updatedProfile;
  }
}
