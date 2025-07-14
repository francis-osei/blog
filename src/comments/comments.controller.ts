import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiResponse } from '../types/api.response';
import { CommentReturn } from './types/comments.type';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from '../decorators/roles.docorator';
import { Request } from 'express';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  @Post(':id')
  async create(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<ApiResponse<CommentReturn>> {
    const { userId } = req.session.user;
    const postId = id;

    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      data: await this.commentsService.create(createCommentDto, userId, postId),
    };
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(): Promise<ApiResponse<CommentReturn[]>> {
    const comments = await this.commentsService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      results: comments.length,
      data: comments,
    };
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): string {
    return this.commentsService.findOne(+id);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<ApiResponse<CommentReturn>> {
    const { userId } = req.session.user;

    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      data: await this.commentsService.update(id, userId, updateCommentDto),
    };
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<CommentReturn>> {
    const { userId } = req.session.user;
    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      data: await this.commentsService.remove(id, userId),
    };
  }
}
