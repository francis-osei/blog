declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: string;
    JWT_SECRET_KEY: string;
    JWT_REFRESH_TOKEN_KEY: string;
    SESSION_SECRET_KEY: string;
  }
}
