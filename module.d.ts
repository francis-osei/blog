import { UserPayload } from 'src/auth/auth.controller';

declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: string;
    JWT_SECRET_KEY: string;
    JWT_REFRESH_TOKEN_KEY: string;
    SESSION_SECRET_KEY: string;
    ACCESS_TOKEN_EXPIRY: string;
    REFRESH_TOKEN_EXPIRY: string;
  }
}

// import { UserPayload } from "src/auth/auth.controller";

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
