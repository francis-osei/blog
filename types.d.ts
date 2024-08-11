import { Role } from '@prisma/client';

declare module 'express-session' {
  interface SessionData {
    user: {
      userId: string;
      username: string;
      role: [Role];
    };
  }
}

declare module 'express' {
  interface Request {
    user: {
      userId: string;
      username: string;
      role: [Role];
    };
  }
}
