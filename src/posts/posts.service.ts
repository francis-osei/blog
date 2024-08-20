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

  update(id: number, updatePostDto: UpdatePostDto): string {
    return `This action updates a #${id} ${updatePostDto} post`;
  }

  remove(id: number): string {
    return `This action removes a #${id} post`;
  }
}
