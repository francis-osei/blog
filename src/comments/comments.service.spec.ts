import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { DatabaseService } from '../database/database.service';
import { CommentReturn } from './types/comments.type';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NotFoundException } from '@nestjs/common';

// type MockDatabaseService = {
//   comment: {
//     create: jest.Mock;
//     findMany: jest.Mock;
//     update: jest.Mock;
//     delete: jest.Mock;
//   };
//   post: jest.Mock;
//   user: jest.Mock;
// };

const mockComment: CommentReturn = {
  id: 'mock-id',
  content: 'First comment',
  createdAt: new Date(),
  updatedAt: new Date(),
  postId: 'post1',
  authorId: 'user1',
  author: { id: 'user1', name: 'john' },
  post: { id: 'post1', title: 'Mock Post' },
};

describe('CommentsService', () => {
  let service: CommentsService;
  let db: jest.Mocked<DatabaseService>;

  const dto: CreateCommentDto = { content: 'Test comment' };
  const userId = 'user-123';
  const postId = 'post-456';
  const commentId = 'content-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: DatabaseService,
          useValue: {
            comment: {
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            post: { findUnique: jest.fn() },
            user: { findUnique: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    db = module.get(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create commnet successfully', async () => {
      const mockPost = { id: postId, title: 'test' };
      const mockUser = { id: userId, name: 'test user' };
      const mockComment = { id: 'comment-789', content: dto.content };

      (db.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (db.comment.create as jest.Mock).mockResolvedValue(mockComment);

      const result = await service.create(dto, userId, postId);

      expect(result).toEqual(mockComment);
      expect(db.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(db.comment.create).toHaveBeenCalledWith({
        data: {
          content: dto.content,
          author: { connect: { id: userId } },
          post: { connect: { id: postId } },
        },
      });
    });

    it('should throw NotFoundException if post not found', async () => {
      (db.post.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.create(dto, userId, postId)).rejects.toThrow(
        new NotFoundException('Post not found'),
      );

      expect(db.user.findUnique).not.toHaveBeenCalled();
      expect(db.comment.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      (db.post.findUnique as jest.Mock).mockResolvedValue({ id: postId });
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.create(dto, userId, postId)).rejects.toThrow(
        new NotFoundException('User not found'),
      );

      expect(db.comment.create).not.toHaveBeenCalled();
    });

    it('should throw if db.comment.create fails', async () => {
      (db.post.findUnique as jest.Mock).mockResolvedValue({ id: postId });
      (db.user.findUnique as jest.Mock).mockResolvedValue({ id: userId });
      (db.comment.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(service.create(dto, userId, postId)).rejects.toThrow(
        'DB error',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of comments', async () => {
      const mockComments = [mockComment];

      (db.comment.findMany as jest.Mock).mockResolvedValue(mockComments);

      const result = await service.findAll();

      expect(db.comment.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockComments);
    });

    it('should return an empty array when no comments exist', async () => {
      (db.comment.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll();

      expect(db.comment.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should throw an error if database query fails', async () => {
      (db.comment.findMany as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.findAll()).rejects.toThrow('DB error');
      expect(db.comment.findMany).toHaveBeenCalled();
    });
  });
  describe('update', () => {
    it('should update the comment content successfully', async () => {
      const dto: UpdateCommentDto = { content: 'Updated comment' };
      const expected = {
        id: commentId,
        content: dto.content,
        postId,
        updatedAt: new Date(),
      };

      (db.comment.update as jest.Mock).mockResolvedValue(expected);

      const result = await service.update(commentId, userId, dto);

      expect(db.comment.update).toHaveBeenCalledWith({
        where: { id: commentId, authorId: userId },
        data: { content: dto.content },
        select: {
          id: true,
          content: true,
          createdAt: false,
          authorId: false,
          postId: true,
          updatedAt: true,
        },
      });

      expect(result).toEqual(expected);
    });

    it('should throw an error when the comment does not exist', async () => {
      (db.comment.update as jest.Mock).mockRejectedValue(
        new Error('Comment not found'),
      );

      await expect(
        service.update(commentId, userId, { content: 'Some content' }),
      ).rejects.toThrow('Comment not found');
    });

    it('should throw an error when the user is not the author', async () => {
      (db.comment.update as jest.Mock).mockRejectedValue(
        new Error('Forbidden'),
      );

      await expect(
        service.update(commentId, 'wrong-user', { content: 'Some content' }),
      ).rejects.toThrow('Forbidden');
    });

    it('should handle empty content gracefully', async () => {
      const dto: UpdateCommentDto = { content: '' };
      (db.comment.update as jest.Mock).mockResolvedValue({
        id: commentId,
        content: '',
        postId,
        updatedAt: new Date(),
      });

      const result = await service.update(commentId, userId, dto);
      expect(result.content).toBe('');
    });

    it('should handle very long content', async () => {
      const longContent = 'a'.repeat(10_000);
      const dto: UpdateCommentDto = { content: longContent };
      const expected = {
        id: commentId,
        content: longContent,
        postId,
        updatedAt: new Date(),
      };

      (db.comment.update as jest.Mock).mockResolvedValue(expected);

      const result = await service.update(commentId, userId, dto);
      expect(result.content.length).toBe(10_000);
      expect(result).toEqual(expected);
    });

    it('should handle database errors gracefully', async () => {
      (db.comment.update as jest.Mock).mockRejectedValue(
        new Error('Database failure'),
      );

      await expect(
        service.update(commentId, userId, { content: 'update test' }),
      ).rejects.toThrow('Database failure');
    });
  });
});
