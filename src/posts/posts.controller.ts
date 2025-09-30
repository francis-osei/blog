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
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostReturn } from './types/posts.return';
import { Request } from 'express';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.docorator';
import { Role } from '@prisma/client';
import { ApiResponse } from '../types/api.response';

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
      statusCode: HttpStatus.CREATED,
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
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<PostReturn>> {
    const post = await this.postsService.findOne(id);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'successful',
      data: post,
    };
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<ApiResponse<PostReturn>> {
    const { userId } = req.session.user;

    const updated = await this.postsService.update(id, userId, updatePostDto);

    if (!updated) {
      throw new NotFoundException(
        `Post with ID ${id} not found or you do not have permission to update it`,
      );
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      data: updated,
    };
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<ApiResponse<PostReturn>> {
    const { userId } = req.session.user;

    const removed = await this.postsService.remove(id, userId);

    if (!removed) {
      throw new NotFoundException(
        `Post with ID ${id} not found or you do not have permission to delete it`,
      );
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      data: removed,
    };
  }
}
