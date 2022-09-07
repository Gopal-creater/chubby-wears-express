export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_COOKIE_EXPIRES_IN: number;
      NODE_ENV: string;
    }
  }
}
