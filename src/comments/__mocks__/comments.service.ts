import { commentsStub, updatedCommentsStud } from '../test/stubs/comments.stub';

export const CommentsService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(commentsStub()),
  findAll: jest.fn().mockResolvedValue([commentsStub()]),
  update: jest.fn().mockResolvedValue(updatedCommentsStud()),
  delete: jest.fn().mockResolvedValue(commentsStub()),
  findOne: jest.fn().mockResolvedValue(commentsStub()),
  remove: jest.fn().mockResolvedValue(commentsStub()),
});
