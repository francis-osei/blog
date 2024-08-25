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

  findAll(): Promise<CommentReturn[]> {
    return this.databaseService.comment.findMany();
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

  remove(id: string, userId: string): Promise<CommentReturn> {
    return this.databaseService.comment.delete({
      where: { id, authorId: userId },
      select: {
        id: true,
      },
    });
  }
}
