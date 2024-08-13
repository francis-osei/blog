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

  findOne(id: number) {
    return `This action returns a #${id} profile`;
  }

  update(id: number, updateProfileDto: UpdateProfileDto) {
    return `This action updates a #${id} ${updateProfileDto} profile`;
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
