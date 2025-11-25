import { mockPostsStub, mockPostStub } from '../test/stubs/posts.stub';

export const PostsService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(mockPostStub()),
  findAll: jest.fn().mockResolvedValue(mockPostsStub()),
  findOne: jest.fn().mockResolvedValue(mockPostStub()),
  update: jest.fn().mockResolvedValue(mockPostStub()),
  remove: jest.fn().mockResolvedValue(mockPostStub()),
});
