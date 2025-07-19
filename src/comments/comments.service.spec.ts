import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { DatabaseService } from '../database/database.service';
import { CommentReturn } from './types/comments.type';
import { UpdateCommentDto } from './dto/update-comment.dto';

type MockDatabaseService = {
  comment: {
    create: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

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
  let db: MockDatabaseService;

  const mockDatabaseService: MockDatabaseService = {
    comment: {
      create: jest
        .fn()
        .mockImplementation(
          (
            createCommentDto: CreateCommentDto,
            userId: string,
            postId: string,
          ) => {
            return Promise.resolve({
              userId,
              postId,
              ...createCommentDto,
            });
          },
        ),
      findMany: jest.fn().mockResolvedValue([mockComment]),
      update: jest
        .fn()
        .mockImplementation(
          (
            commentId: string,
            postId: string,
            updateCommentDto: UpdateCommentDto,
          ) => {
            return Promise.resolve({
              userId,
              postId,
              ...updateCommentDto,
            });
          },
        ),
      delete: jest.fn(),
    },
  };

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
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    db = module.get(DatabaseService) as MockDatabaseService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create commnet successfully', async () => {
      db.comment.create.mockResolvedValue({ id: 'mock-id', ...dto });

      const result = await service.create(dto, userId, postId);

      expect(db.comment.create).toHaveBeenCalled();
      expect(db.comment.create).toHaveBeenCalledWith({
        data: {
          content: dto.content,
          author: { connect: { id: userId } },
          post: { connect: { id: postId } },
        },
      });
      expect(result).toEqual({ id: 'mock-id', ...dto });
    });

    it('should fail if content if empty', async () => {
      const dto = { content: '' };

      db.comment.create.mockRejectedValue(new Error('Content cannot be empty'));
      await expect(service.create(dto, userId, postId)).rejects.toThrow(
        'Content cannot be empty',
      );
    });

    it('should fail if userId is missing', async () => {
      db.comment.create.mockRejectedValue(new Error('User not found'));

      await expect(service.create(dto, '', postId)).rejects.toThrow(
        'User not found',
      );
    });

    it('should fail if postId is missing', async () => {
      db.comment.create.mockRejectedValue(new Error('Post not found'));

      await expect(service.create(dto, userId, '')).rejects.toThrow(
        'Post not found',
      );
    });

    it('should handle very long content', async () => {
      const longContent = 'a'.repeat(10_000);
      const dto = { content: longContent };
      const expected = { id: 'mock-id', ...dto };

      db.comment.create.mockResolvedValue(expected);

      const result = await service.create(dto, userId, postId);
      expect(result).toEqual(expected);
    });

    it('should throw if database throws an error', async () => {
      db.comment.create.mockRejectedValue(new Error('DB failure'));

      await expect(service.create(dto, userId, postId)).rejects.toThrow(
        'DB failure',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of comments', async () => {
      const mockComments = [mockComment];

      db.comment.findMany.mockResolvedValue(mockComments);

      const result = await service.findAll();

      expect(db.comment.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockComments);
    });

    it('should return an empty array when no comments exist', async () => {
      db.comment.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(db.comment.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should throw an error if database query fails', async () => {
      db.comment.findMany.mockRejectedValue(new Error('DB error'));

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

      db.comment.update.mockResolvedValue(expected);

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
      db.comment.update.mockRejectedValue(new Error('Comment not found'));

      await expect(
        service.update(commentId, userId, { content: 'Some content' }),
      ).rejects.toThrow('Comment not found');
    });

    it('should throw an error when the user is not the author', async () => {
      db.comment.update.mockRejectedValue(new Error('Forbidden'));

      await expect(
        service.update(commentId, 'wrong-user', { content: 'Some content' }),
      ).rejects.toThrow('Forbidden');
    });

    it('should handle empty content gracefully', async () => {
      const dto: UpdateCommentDto = { content: '' };
      db.comment.update.mockResolvedValue({
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

      db.comment.update.mockResolvedValue(expected);

      const result = await service.update(commentId, userId, dto);
      expect(result.content.length).toBe(10_000);
      expect(result).toEqual(expected);
    });

    it('should handle database errors gracefully', async () => {
      db.comment.update.mockRejectedValue(new Error('Database failure'));

      await expect(
        service.update(commentId, userId, { content: 'update test' }),
      ).rejects.toThrow('Database failure');
    });
  });
});
