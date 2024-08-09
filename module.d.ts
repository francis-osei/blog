declare namespace NodeJS {
  export interface ProcessEnv {
    JWT_SECRET_KEY: string;
    JWT_REFRESH_TOKEN_KEY: string;
  }
}
