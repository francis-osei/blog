import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { DatabaseService } from 'src/database/database.service';
import { CommentReturn } from './types/comments.type';

@Injectable()
export class CommentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(
    createCommentDto: CreateCommentDto,
    userId: string,
    postId: string,
  ): Promise<CommentReturn> {
    return this.databaseService.comment.create({
      data: {
        content: createCommentDto.content,
        author: { connect: { id: userId } },
        post: { connect: { id: postId } },
      },
    });
  }

  findAll(): string {
    return `This action returns all comments`;
  }

  findOne(id: number): string {
    return `This action returns a #${id} comment`;
  }

  update(
    id: string,
    userId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<CommentReturn> {
    return this.databaseService.comment.update({
      where: { id, authorId: userId },
      data: { content: updateCommentDto.content },
      select: {
        id: true,
        content: true,
        createdAt: false,
        authorId: false,
        postId: true,
        updatedAt: true,
      },
    });
  }

  remove(id: number): string {
    return `This action removes a #${id} comment`;
  }
}
