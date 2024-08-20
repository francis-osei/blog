export type PostReturn = {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  published: boolean;
  createdAt: Date;
  updatedAt?: Date;
  parentId: number;
  authorId: string;
  coverImage: string;
  comments?: Comment[] | [];
};

type Comment = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  postId: string;
  authorId: string;
};
