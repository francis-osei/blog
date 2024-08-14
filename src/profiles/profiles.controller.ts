import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/roles.guard';
import { ApiResponse } from 'src/types/api.response';
import { ProfileReturn } from './types/profiles.response';
import { Roles } from 'src/decorators/roles.docorator';
import { Role } from '@prisma/client';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @UseGuards(AuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  @Post()
  async create(
    @Req() req: Request,
    @Body() createProfileDto: CreateProfileDto,
  ): Promise<ApiResponse<ProfileReturn>> {
    const { userId } = req.session.user;

    return {
      statusCode: HttpStatus.OK,
      message: 'successful',
      data: await this.profilesService.create(createProfileDto, userId),
    };
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(): Promise<ApiResponse<ProfileReturn[]>> {
    const userProfiles = await this.profilesService.findAll();

    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      results: userProfiles.length,
      data: userProfiles,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<ProfileReturn>> {
    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      data: await this.profilesService.findOne(id),
    };
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ApiResponse<ProfileReturn>> {
    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      data: await this.profilesService.update(id, updateProfileDto),
    };
  }
}
