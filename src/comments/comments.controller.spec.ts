import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/roles.guard';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentReturn } from './types/comments.type';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

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

  const mockCommentsService = {
    findAll: jest.fn().mockResolvedValue([mockComment]),
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
    findOne: jest.fn().mockResolvedValue('Single comment'),
    update: jest
      .fn()
      .mockImplementation(
        (
          id: string,
          userId: string,
          updateCommentDto: UpdateCommentDto,
        ): Promise<CommentReturn> => {
          return Promise.resolve({
            id,
            content: updateCommentDto.content,
            updatedAt: new Date(),
            postId: 'mock-post-id',
          });
        },
      ),
    remove: jest.fn().mockResolvedValue(mockComment),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        {
          provide: AuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: RoleGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  describe('create', () => {
    const postId = 'post-id';
    const userId = 'user-id';
    const dto: CreateCommentDto = {
      content: 'Hello world',
    };

    it('should create a comment and return ApiResponse', async () => {
      const req = {
        session: {
          user: {
            userId: 'user-id',
          },
        },
      } as Request;

      mockCommentsService.create.mockResolvedValue(mockComment);

      const result = await controller.create(postId, req, dto);

      expect(service.create).toHaveBeenCalledWith(dto, userId, postId);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: mockComment,
      });
    });

    it('should throw if session is missing', async () => {
      const req = {} as Request;

      await expect(controller.create(postId, req, dto)).rejects.toThrow();
    });

    it('should throw if session.user is missing', async () => {
      const req = { session: {} } as unknown as Request;

      await expect(controller.create(postId, req, dto)).rejects.toThrow();
    });

    it('should throw an error if service throws', async () => {
      const req = {
        session: { user: { userId } },
      } as unknown as Request;

      mockCommentsService.create.mockRejectedValue(
        new Error('Database failure'),
      );

      await expect(controller.create(postId, req, dto)).rejects.toThrow(
        'Database failure',
      );
    });

    it('should throw if DTO is invalid (missing content)', async () => {
      const req = {
        session: { user: { userId } },
      } as unknown as Request;

      const invalidDto = {} as CreateCommentDto;

      // If you use class-validator with ValidationPipe globally, the controller will reject invalid DTOs
      await expect(
        controller.create(postId, req, invalidDto),
      ).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all comments in ApiResponse', async () => {
      mockCommentsService.findAll.mockResolvedValue([mockComment]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Successful',
        results: [mockComment].length,
        data: [mockComment],
      });
    });
  });

  describe('findOne', () => {
    it('should return a single comment', () => {
      mockCommentsService.findOne.mockReturnValue('Single comment');

      const result = controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe('Single comment');
    });
  });

  describe('remove', () => {
    it('should delete a comment and return ApiResponse', async () => {
      const req = {
        session: {
          user: {
            userId: 'user-id',
          },
        },
      } as Request;

      mockCommentsService.remove.mockResolvedValue(mockComment);

      const result = await controller.remove(req, '1');

      expect(service.remove).toHaveBeenCalledWith('1', 'user-id');
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: mockComment,
      });
    });
  });

  describe('update', () => {
    const commentId = 'comment-id';
    const userId = 'user-id';
    const dto: UpdateCommentDto = { content: 'Updated content' };

    it('should update a comment and return ApiResponse (success)', async () => {
      const req = {
        session: { user: { userId } },
      } as unknown as Request;

      const mockUpdatedComment = {
        id: commentId,
        content: dto.content,
        postId: 'mock-post-id',
        updatedAt: new Date(),
      };

      mockCommentsService.update.mockResolvedValue(mockUpdatedComment);

      const result = await controller.update(req, commentId, dto);

      expect(service.update).toHaveBeenCalledWith(commentId, userId, dto);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: {
          id: commentId,
          content: dto.content,
          postId: 'mock-post-id',
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should throw if session is missing', async () => {
      const req = {} as Request;

      await expect(controller.update(req, commentId, dto)).rejects.toThrow();
    });

    it('should throw if session.user is missing', async () => {
      const req = { session: {} } as unknown as Request;

      await expect(controller.update(req, commentId, dto)).rejects.toThrow();
    });

    it('should throw NotFoundException if comment not found', async () => {
      const req = {
        session: { user: { userId } },
      } as unknown as Request;

      mockCommentsService.update.mockRejectedValueOnce({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Comment not found',
      });

      await expect(controller.update(req, commentId, dto)).rejects.toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Comment not found',
      });

      expect(service.update).toHaveBeenCalledWith(commentId, userId, dto);
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const req = {
        session: { user: { userId } },
      } as unknown as Request;

      mockCommentsService.update.mockRejectedValueOnce({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
      });

      await expect(controller.update(req, commentId, dto)).rejects.toEqual({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
      });

      expect(service.update).toHaveBeenCalledWith(commentId, userId, dto);
    });

    it('should throw error if service throws unexpected error', async () => {
      const req = {
        session: { user: { userId } },
      } as unknown as Request;

      mockCommentsService.update.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(controller.update(req, commentId, dto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
