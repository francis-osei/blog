import { PostReturn } from '../posts/types/posts.return';
import { userReturn } from '../users/types/uses.return';

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
