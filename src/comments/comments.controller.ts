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
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiResponse } from 'src/types/api.response';
import { CommentReturn } from './types/comments.type';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/decorators/roles.docorator';
import { Request } from 'express';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  @Post(':id')
  async create(
    @Param('id') id: string,
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

  @Get()
  findAll(): string {
    return this.commentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return this.commentsService.findOne(+id);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<ApiResponse<CommentReturn>> {
    const { userId } = req.session.user;

    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      data: await this.commentsService.update(id, userId, updateCommentDto),
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string): string {
    return this.commentsService.remove(+id);
  }
}
