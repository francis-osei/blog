import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DatabaseService } from 'src/database/database.service';
import { PostReturn } from './types/posts.return';

@Injectable()
export class PostsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    createPostDto: CreatePostDto,
    userId: string,
  ): Promise<PostReturn> {
    const postSlug = this.getSlug(createPostDto.title);

    const post = await this.databaseService.post.create({
      data: {
        ...createPostDto,
        slug: postSlug,
        author: { connect: { id: userId } },
      },
    });

    return post;
  }

  private getSlug(postTitle: string): string {
    return postTitle
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  findAll(userId: string, published: boolean | null): Promise<PostReturn[]> {
    return this.databaseService.post.findMany({
      where: {
        author: { id: userId },
        ...(published !== null && { published }),
      },
    });
  }

  findOne(id: string): Promise<PostReturn> {
    return this.databaseService.post.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    userId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<PostReturn> {
    return this.databaseService.post.update({
      where: { id, authorId: userId },
      data: {
        title: updatePostDto.title,
        slug: this.getSlug(updatePostDto.title),
        content: updatePostDto.content,
        summary: updatePostDto.summary,
        coverImage: updatePostDto.coverImage,
      },
    });
  }

  async remove(id: string, userId: string): Promise<PostReturn> {
    return await this.databaseService.post.delete({
      where: { id, authorId: userId },
      select: {
        id: true,
        title: false,
        slug: false,
        summary: false,
        content: false,
        coverImage: false,
      },
    });
  }
}
