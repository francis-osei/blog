import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { DatabaseService } from '../database/database.service';

type MockDatabaseService = {
  comment: {
    create: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

const mockComment = {
  id: '1',
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
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const dto: CreateCommentDto = { content: 'Test comment' };
  const userId = 'user-123';
  const postId = 'post-456';

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
