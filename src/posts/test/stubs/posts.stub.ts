import { CreatePostDto } from 'src/posts/dto/create-post.dto';
import { UpdatePostDto } from 'src/posts/dto/update-post.dto';
import { PostReturn } from 'src/posts/types/posts.return';

export const userId = 'user-1234';

export const dtoStub = (): CreatePostDto => {
  return {
    title: 'My first post',
    content: 'This is my first post content with at least 20 chars',
    coverImage: 'http://example.com/image.png',
    summary: 'Optional summary',
  };
};

export const mockPostStub = (): PostReturn => {
  return {
    id: 'post-123',
    title: dtoStub().title,
    slug: 'my-first-post',
    content: dtoStub().content,
    summary: dtoStub().summary,
    coverImage: dtoStub().coverImage,
    published: false,
    authorId: userId,
  };
};

export const updateDtoStub = (): UpdatePostDto => {
  return {
    title: 'Updated Title',
    content: 'Updated content',
    summary: 'Updated summary',
    coverImage: 'http://example.com/cover.png',
  };
};

export const mockPostsStub = (): PostReturn[] => {
  return [
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
};
