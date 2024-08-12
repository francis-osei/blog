export const _env = {
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  JWT_REFRESH_TOKEN_KEY: process.env.JWT_REFRESH_TOKEN_KEY,
  SESSION_SECRET_KEY: process.env.SESSION_SECRET_KEY,
  ACCESS_TOKEN_EXPIRY: Number(process.env.ACCESS_TOKEN_EXPIRY),
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
} as const;
