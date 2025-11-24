import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { UpdateCommentDto } from 'src/comments/dto/update-comment.dto';
import { CommentReturn } from 'src/comments/types/comments.type';

export const updateDto: UpdateCommentDto = { content: 'Updated comment' };

export const commentsDto: CreateCommentDto = {
  content: 'Hello world',
};

export const commentsStub = (): CommentReturn => {
  return {
    id: 'mock-id',
    content: 'Hello world',
    createdAt: new Date(),
    updatedAt: new Date(),
    postId: 'post1',
    authorId: 'user1',
    author: { id: 'user1', name: 'john' },
    post: { id: 'post1', title: 'Mock Post' },
  };
};

export const updatedCommentsStud = (): CommentReturn => {
  return {
    id: 'mock-id',
    content: 'First comment',
    postId: 'mock-post-id',
    updatedAt: new Date(),
  };
};
