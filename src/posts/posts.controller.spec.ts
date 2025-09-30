import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/roles.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { PostReturn } from './types/posts.return';
import { ApiResponse } from '../types/api.response';
import { Request } from 'express';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { UpdatePostDto } from './dto/update-post.dto';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: jest.Mocked<PostsService>;

  const userId = 'user-1234';

  const dto: CreatePostDto = {
    title: 'My first post',
    content: 'This is my first post content with at least 20 chars',
    coverImage: 'http://example.com/image.png',
    summary: 'Optional summary',
  };

  const mockPost: PostReturn = {
    id: 'post-123',
    title: dto.title,
    slug: 'my-first-post',
    content: dto.content,
    summary: dto.summary,
    coverImage: dto.coverImage,
    published: false,
    authorId: userId,
  };

  const updateDto: UpdatePostDto = {
    title: 'Updated Title',
    content: 'Updated content',
    summary: 'Updated summary',
    coverImage: 'http://example.com/cover.png',
  };

  const mockPosts: PostReturn[] = [
    {
      id: '1',
      title: 'Post 1',
      slug: 'post-1',
      content: '...',
      summary: '...',
      coverImage: 'img.png',
      published: true,
      authorId: userId,
    },
    {
      id: '2',
      title: 'Draft Post',
      slug: 'draft-post',
      content: '...',
      summary: '...',
      coverImage: 'img.png',
      published: false,
      authorId: userId,
    },
  ];

  const req = {
    session: { user: { userId: userId } },
  } as Request;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockPost),
            findAll: jest.fn().mockResolvedValue(mockPosts),
            findOne: jest.fn().mockResolvedValue(mockPost),
            update: jest.fn().mockResolvedValue(mockPost),
            remove: jest.fn().mockResolvedValue(mockPost),
          },
        },
      ],
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
