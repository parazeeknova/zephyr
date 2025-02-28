import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = createEnv({
  server: {
    DATABASE_URL: z.string().url().min(1),
    POSTGRES_PRISMA_URL: z.string().url().min(1),
    POSTGRES_URL_NON_POOLING: z.string().url().min(1),
    POSTGRES_USER: z.string().min(1).default('postgres'),
    POSTGRES_PASSWORD: z.string().min(1).default('postgres'),
    POSTGRES_DB: z.string().min(1).default('zephyr'),
    POSTGRES_PORT: z
      .string()
      .transform((val) => Number.parseInt(val, 10))
      .default('5433'),
    POSTGRES_HOST: z.string().min(1).default('localhost'),
    REDIS_PASSWORD: z.string().min(1).default('zephyrredis'),
    REDIS_PORT: z
      .string()
      .transform((val) => Number.parseInt(val, 10))
      .default('6379'),
    REDIS_HOST: z.string().min(1).default('localhost'),
    REDIS_URL: z
      .string()
      .url()
      .default('redis://:zephyrredis@localhost:6379/0')
      .transform((val) => {
        const password = process.env.REDIS_PASSWORD;
        const host = process.env.REDIS_HOST;
        const port = process.env.REDIS_PORT;
        if (password && host && port) {
          return `redis://:${password}@${host}:${port}/0`;
        }
        return val;
      }),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
  },

  client: {
    // No client-side env vars needed for database or Redis
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DB: process.env.POSTGRES_DB,
    POSTGRES_PORT: process.env.POSTGRES_PORT,
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_URL: process.env.REDIS_URL,
    NODE_ENV: process.env.NODE_ENV,
  },

  skipValidation: process.env.NODE_ENV === 'production',
});
