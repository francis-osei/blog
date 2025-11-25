import { Request } from 'express';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/roles.guard';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import {
  commentsStub,
  commentsDto,
  updatedCommentsStud,
} from './test/stubs/comments.stub';

jest.mock('./comments.service');

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  const mockComment = commentsStub();
  const mockUpdatedComment = updatedCommentsStud();

  const userId = 'user-id';
  const postId = 'post-id';

  let req: Request;

  beforeEach(async () => {
    req = {
      session: { user: { userId } },
    } as Request;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [CommentsService],
    })

      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a comment and return ApiResponse', async () => {
      const result = await controller.create(postId, req, commentsDto);

      expect(service.create).toHaveBeenCalledWith(commentsDto, userId, postId);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: {
          ...mockComment,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should throw if session is missing', async () => {
      req = {} as Request;

      await expect(
        controller.create(postId, req, commentsDto),
      ).rejects.toThrow();
    });

    it('should throw if session.user is missing', async () => {
      req = { session: {} } as unknown as Request;

      await expect(
        controller.create(postId, req, commentsDto),
      ).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all comments in ApiResponse', async () => {
      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Successful',
        results: [mockComment].length,
        data: [
          {
            ...mockComment,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        ],
      });
    });

    it('should return empty list when no comment exist', async () => {
      (service.findAll as jest.Mock).mockResolvedValueOnce([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Successful',
        results: 0,
        data: [],
      });
    });

    it('should throw error if service throws', async () => {
      (service.findAll as jest.Mock).mockRejectedValue(
        new Error('Unexpected failure'),
      );

      await expect(controller.findAll()).rejects.toThrow('Unexpected failure');
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single comment', () => {
      (service.findOne as jest.Mock).mockReturnValue(mockComment);

      const result = controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe(mockComment);
    });
  });

  describe('remove', () => {
    it('should delete a comment and return ApiResponse', async () => {
      (service.remove as jest.Mock).mockResolvedValue(mockComment);

      const result = await controller.remove(req, mockComment.id);

      expect(service.remove).toHaveBeenCalledWith(mockComment.id, userId);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: mockComment,
      });
    });
    it('should throw if session is missing', async () => {
      req = {} as Request;

      await expect(controller.remove(req, mockComment.id)).rejects.toThrow();
    });

    it('should throw if session.user is missing', async () => {
      req = { session: {} } as Request;

      await expect(controller.remove(req, mockComment.id)).rejects.toThrow();
    });
  });

  describe('update', () => {
    // const commentsDto: UpdateCommentcommentsDto = { content: 'Updated content' };

    it('should update a comment and return ApiResponse (success)', async () => {
      req = {
        session: { user: { userId } },
      } as unknown as Request;

      // const mockUpdatedComment = {
      //   id: mockComment.id,
      //   content: mockComment.content,
      //   postId: 'mock-post-id',
      //   updatedAt: new Date(),
      // };

      (service.update as jest.Mock).mockResolvedValue(mockUpdatedComment);

      const result = await controller.update(req, mockComment.id, commentsDto);

      expect(service.update).toHaveBeenCalledWith(
        mockComment.id,
        userId,
        commentsDto,
      );
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: mockUpdatedComment,
      });
    });

    it('should throw if session is missing', async () => {
      req = {} as Request;

      await expect(
        controller.update(req, mockComment.id, commentsDto),
      ).rejects.toThrow();
    });

    it('should throw if session.user is missing', async () => {
      req = { session: {} } as unknown as Request;

      await expect(
        controller.update(req, mockComment.id, commentsDto),
      ).rejects.toThrow();
    });

    it('should throw NotFoundException if comment not found', async () => {
      (service.update as jest.Mock).mockRejectedValueOnce({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Comment not found',
      });

      await expect(
        controller.update(req, mockComment.id, commentsDto),
      ).rejects.toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Comment not found',
      });

      expect(service.update).toHaveBeenCalledWith(
        mockComment.id,
        userId,
        commentsDto,
      );
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      (service.update as jest.Mock).mockRejectedValueOnce({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
      });

      await expect(
        controller.update(req, mockComment.id, commentsDto),
      ).rejects.toEqual({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
      });

      expect(service.update).toHaveBeenCalledWith(
        mockComment.id,
        userId,
        commentsDto,
      );
    });

    it('should throw error if service throws unexpected error', async () => {
      (service.update as jest.Mock).mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(
        controller.update(req, mockComment.id, commentsDto),
      ).rejects.toThrow('Database error');
    });
  });
});
