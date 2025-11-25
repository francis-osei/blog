import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/roles.guard';
import { PostReturn } from './types/posts.return';
import { ApiResponse } from '../types/api.response';
import { Request } from 'express';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import {
  dtoStub,
  mockPostsStub,
  mockPostStub,
  updateDtoStub,
  userId,
} from './test/stubs/posts.stub';

jest.mock('./posts.service');

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: jest.Mocked<PostsService>;

  const dto = dtoStub();
  const mockPost = mockPostStub();
  const mockPosts = mockPostsStub();
  const updateDto = updateDtoStub();

  const req = {
    session: { user: { userId } },
  } as Request;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [PostsService],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a post successfully', async () => {
      const result: ApiResponse<PostReturn> = await controller.create(req, dto);

      expect(postsService.create).toHaveBeenCalledWith(dto, userId);
      expect(result).toEqual({
        statusCode: 201,
        message: 'successful',
        data: mockPost,
      });
    });

    it('should throw if service.create fails', async () => {
      postsService.create.mockRejectedValue(new Error('DB error'));

      await expect(controller.create(req, dto)).rejects.toThrow('DB error');
    });
  });

  describe('findAll', () => {
    it('should return all posts when published is "true"', async () => {
      const updatedMockPosts = mockPosts.map((item) => ({
        ...item,
        published: true,
      }));

      postsService.findAll.mockResolvedValue(updatedMockPosts);

      const result: ApiResponse<PostReturn[]> = await controller.findAll(
        req,
        'true',
      );

      expect(postsService.findAll).toHaveBeenCalledWith(userId, true);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'successful',
        results: updatedMockPosts.length,
        data: updatedMockPosts,
      });
    });

    it('should return unpublished posts when published is "false"', async () => {
      const updatedMockPosts = mockPosts.map((item) => ({
        ...item,
        published: false,
      }));

      postsService.findAll.mockResolvedValue(updatedMockPosts);

      const result = await controller.findAll(req, 'false');

      expect(postsService.findAll).toHaveBeenCalledWith(userId, false);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'successful',
        results: updatedMockPosts.length,
        data: updatedMockPosts,
      });
    });

    it('should return all posts when published is undefined', async () => {
      postsService.findAll.mockResolvedValue(mockPosts);

      const result = await controller.findAll(req, undefined);

      expect(postsService.findAll).toHaveBeenCalledWith(userId, null);
      expect(result.results).toBe(2);
      expect(result.data).toEqual(mockPosts);
    });
  });

  describe('findOne', () => {
    it('should return the post when found', async () => {
      postsService.findOne.mockResolvedValue(mockPost);

      const result = await controller.findOne(mockPost.id);

      expect(postsService.findOne).toHaveBeenCalledWith(mockPost.id);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'successful',
        data: mockPost,
      });
    });

    it('should throw NotFoundException when post does not exist', async () => {
      postsService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('non-existing-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(postsService.findOne).toHaveBeenCalledWith('non-existing-id');
    });
  });

  describe('update', () => {
    it('should update a post successfully', async () => {
      const result = await controller.update(mockPost.id, req, updateDto);

      expect(postsService.update).toHaveBeenCalledWith(
        mockPost.id,
        userId,
        updateDto,
      );
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: mockPost,
      });
    });

    it('should throw NotFoundException if post is not found or not owned by user', async () => {
      postsService.update.mockResolvedValue(null);

      await expect(
        controller.update(mockPost.id, req, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a post successfully', async () => {
      const result = await controller.remove(mockPost.id, req);

      expect(postsService.remove).toHaveBeenCalledWith(mockPost.id, userId);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: mockPost,
      });
    });

    it('should throw NotFoundException if post does not exist', async () => {
      postsService.remove.mockResolvedValue(null);

      await expect(controller.remove(mockPost.id, req)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if user does not own the post', async () => {
      postsService.remove.mockResolvedValue(null);

      await expect(controller.remove('post-456', req)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
