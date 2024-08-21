import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpStatus,
  HttpCode,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostReturn } from './types/posts.return';
import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.docorator';
import { Role } from '@prisma/client';
import { ApiResponse } from 'src/types/api.response';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  @Post()
  async create(
    @Req() req: Request,
    @Body() createPostDto: CreatePostDto,
  ): Promise<ApiResponse<PostReturn>> {
    const { userId } = req.session.user;

    return {
      statusCode: HttpStatus.OK,
      message: 'successful',
      data: await this.postsService.create(createPostDto, userId),
    };
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Req() req: Request,
    @Query('published') published?: 'true' | 'false',
  ): Promise<ApiResponse<PostReturn[]>> {
    const { userId } = req.session.user;

    const isPublished =
      published === 'true' ? true : published === 'false' ? false : null;

    const posts = await this.postsService.findAll(userId, isPublished);

    return {
      statusCode: HttpStatus.OK,
      message: 'successful',
      results: posts.length,
      data: posts,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<PostReturn>> {
    return {
      statusCode: HttpStatus.OK,
      message: 'successful',
      data: await this.postsService.findOne(id),
    };
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<ApiResponse<PostReturn>> {
    const { userId } = req.session.user;

    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      data: await this.postsService.update(id, userId, updatePostDto),
    };
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ApiResponse<PostReturn>> {
    const { userId } = req.session.user;

    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      data: await this.postsService.remove(id, userId),
    };
  }
}
