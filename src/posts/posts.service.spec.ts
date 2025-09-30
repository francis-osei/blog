import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { DatabaseService } from '../database/database.service';
import { PostReturn } from './types/posts.return';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { NotFoundException } from '@nestjs/common';

describe('PostsService', () => {
  let service: PostsService;
  let db: DatabaseService;

  const userId = 'user-123';
  const postId = 'post-123';

  const dto: CreatePostDto = {
    title: 'My First Post',
    content: 'Some content',
    summary: 'A short summary',
    coverImage: 'image.png',
  };

  const mockPost: PostReturn = {
    id: 'post-id',
    title: dto.title,
    content: dto.content,
    summary: dto.summary,
    coverImage: dto.coverImage,
    slug: 'my-first-post',
    authorId: 'user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPosts: PostReturn[] = [mockPost];

  const updateDto: UpdatePostDto = {
    title: 'Updated Post Title',
    content: 'Updated post content with more than 20 characters',
    summary: 'Updated summary',
    coverImage: 'http://example.com/image.jpg',
  };

  const existingPost: PostReturn = {
    id: postId,
    title: 'Old Title',
    content: 'Old content here',
    summary: 'Old summary',
    coverImage: 'http://example.com/old.jpg',
    slug: 'old-title',
    authorId: userId,
  };

  const updatedPost: PostReturn = {
    ...existingPost,
    ...updateDto,
    slug: 'updated-post-title',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: DatabaseService,
          useValue: {
            post: {
              create: jest.fn().mockResolvedValue(mockPost),
              findFirst: jest.fn().mockResolvedValue(existingPost),
              update: jest.fn().mockResolvedValue(updateDto),
              delete: jest.fn().mockResolvedValue({ id: postId }),
              findUnique: jest.fn().mockResolvedValue(mockPost),
              findMany: jest.fn().mockResolvedValue(mockPosts),
              findOne: jest.fn().mockResolvedValue(mockPost),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    db = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a post with a generated slug', async () => {
      const result = await service.create(dto, userId);

      expect(db.post.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          slug: 'my-first-post',
          author: { connect: { id: userId } },
        },
      });
      expect(result).toEqual(mockPost);
    });
  });

  describe('getSlug', () => {
    it('should generate a slug from post title', () => {
      const slug = (service as PostsService)['getSlug'](
        'Hello World! This is a Test',
      );

      expect(slug).toBe('hello-world-this-is-a-test');
    });

    it('should trim extra dashes', () => {
      const slug = (service as PostsService)['getSlug']('---Hello  World---');
      expect(slug).toBe('hello-world');
    });
  });

  describe('update', () => {
    it('should update a post successfully', async () => {
      const result = await service.update(postId, userId, updateDto);

      expect(db.post.findFirst).toHaveBeenCalledWith({
        where: { id: postId, authorId: userId },
      });
      expect(db.post.update).toHaveBeenCalledWith({
        where: { id: postId, authorId: userId },
        data: {
          title: updateDto.title,
          slug: 'updated-post-title',
          content: updateDto.content,
          summary: updateDto.summary,
          coverImage: updateDto.coverImage,
        },
      });
      expect(result).toEqual(updateDto);
    });

    it('should throw NotFoundException if post not found or not owned', async () => {
      (db.post.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.update(postId, userId, updateDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(db.post.update).not.toHaveBeenCalled();
    });

    it('should regenerate slug when updating title', async () => {
      (db.post.update as jest.Mock).mockResolvedValue(updatedPost);

      const result = await service.update(postId, userId, updateDto);

      expect(result.slug).toBe('updated-post-title');
    });
  });

  describe('remove', () => {
    it('should delete a post if it exists and belongs to the user', async () => {
      const result = await service.remove(postId, userId);

      expect(db.post.findFirst).toHaveBeenCalledWith({
        where: { id: postId, authorId: userId },
      });
      expect(db.post.delete).toHaveBeenCalledWith({
        where: { id: postId, authorId: userId },
        select: {
          id: true,
          title: false,
          content: false,
          summary: false,
          coverImage: false,
          slug: false,
        },
      });
      expect(result).toEqual({ id: postId });
    });

    it('should throw NotFoundException if post does not exist or not owned', async () => {
      (db.post.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('1', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
      expect(db.post.delete).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a post if found', async () => {
      const result = await service.findOne('123');

      expect(result).toEqual(mockPost);
      expect(db.post.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });

    it('should throw NotFoundException if post is not found', async () => {
      (db.post.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(
        new NotFoundException('Post with ID 999 not found'),
      );

      expect(db.post.findUnique).toHaveBeenCalledWith({
        where: { id: '999' },
      });
    });
  });
  describe('findAll', () => {
    it('should return all unpublished posts for a user', async () => {
      const published = false;

      const result = await service.findAll(userId, published);

      expect(db.post.findMany).toHaveBeenCalledWith({
        where: { author: { id: userId }, published },
      });
      expect(result).toEqual(mockPosts);
    });

    it('should return an empty array if no posts match', async () => {
      const published = true;

      (db.post.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll(userId, published);

      expect(db.post.findMany).toHaveBeenCalledWith({
        where: { author: { id: userId }, published },
      });
      expect(result).toEqual([]);
    });
  });
});
