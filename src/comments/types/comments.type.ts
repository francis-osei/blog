import { PostReturn } from 'src/posts/types/posts.return';
import { userReturn } from 'src/users/types/uses.return';

export type CommentReturn = {
  id: string;
  content?: string;
  createdAt?: Date;
  updatedAt?: Date;
  postId?: string;
  authorId?: string;
  author?: userReturn | object;
  post?: PostReturn | object;
};
