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

  @Get()
  findAll(): string {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): string {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): string {
    return this.postsService.remove(+id);
  }
}
