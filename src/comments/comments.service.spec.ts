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
});
