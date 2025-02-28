import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = createEnv({
  server: {
    POSTGRES_USER: z.string().min(1).default('postgres'),
    POSTGRES_PASSWORD: z.string().min(1).default('postgres'),
    POSTGRES_DB: z.string().min(1).default('zephyr'),
    POSTGRES_PORT: z
      .string()
      .transform((val) => Number.parseInt(val, 10))
      .default('5433'),
    POSTGRES_HOST: z.string().min(1).default('localhost'),
    DATABASE_URL: z.string().url(),
    POSTGRES_PRISMA_URL: z.string().url(),
    POSTGRES_URL_NON_POOLING: z.string().url(),
    REDIS_PASSWORD: z.string().min(1),
    REDIS_PORT: z
      .string()
      .transform((val) => Number.parseInt(val, 10))
      .default('6379'),
    REDIS_HOST: z.string().min(1).default('localhost'),
    REDIS_URL: z.string().url(),
    MINIO_ROOT_USER: z.string().min(1).default('minioadmin'),
    MINIO_ROOT_PASSWORD: z.string().min(1).default('minioadmin'),
    MINIO_BUCKET_NAME: z.string().min(1).default('uploads'),
    MINIO_PORT: z
      .string()
      .transform((val) => Number.parseInt(val, 10))
      .default('9000'),
    MINIO_CONSOLE_PORT: z
      .string()
      .transform((val) => Number.parseInt(val, 10))
      .default('9001'),
    MINIO_HOST: z.string().min(1).default('localhost'),
    MINIO_ENDPOINT: z.string().url(),
    MINIO_ENABLE_OBJECT_LOCKING: z.enum(['on', 'off']).default('on'),
    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.string().min(1).default('7d'),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    NEXT_TELEMETRY_DISABLED: z.enum(['0', '1']).default('1'),
    TURBO_TELEMETRY_DISABLED: z.enum(['0', '1']).default('1'),
    UNSEND_API_KEY: z.string().optional(),
    CRON_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    STREAM_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    DISCORD_CLIENT_ID: z.string().optional(),
    DISCORD_CLIENT_SECRET: z.string().optional(),
    TWITTER_CLIENT_ID: z.string().optional(),
    TWITTER_CLIENT_SECRET: z.string().optional(),
  },

  client: {
    NEXT_PUBLIC_PORT: z
      .string()
      .transform((val) => Number.parseInt(val, 10))
      .default('3000'),
    NEXT_PUBLIC_URL: z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_MINIO_ENDPOINT: z.string().url(),
    NEXT_PUBLIC_STREAM_KEY: z.string().optional(),
    NEXT_PUBLIC_STREAM_CONFIGURED: z.enum(['true', 'false']).default('false'),
  },

  runtimeEnv: {
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DB: process.env.POSTGRES_DB,
    POSTGRES_PORT: process.env.POSTGRES_PORT,
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    DATABASE_URL: process.env.DATABASE_URL,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_URL: process.env.REDIS_URL,
    MINIO_ROOT_USER: process.env.MINIO_ROOT_USER,
    MINIO_ROOT_PASSWORD: process.env.MINIO_ROOT_PASSWORD,
    MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME,
    MINIO_PORT: process.env.MINIO_PORT,
    MINIO_CONSOLE_PORT: process.env.MINIO_CONSOLE_PORT,
    MINIO_HOST: process.env.MINIO_HOST,
    MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
    MINIO_ENABLE_OBJECT_LOCKING: process.env.MINIO_ENABLE_OBJECT_LOCKING,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED,
    TURBO_TELEMETRY_DISABLED: process.env.TURBO_TELEMETRY_DISABLED,
    UNSEND_API_KEY: process.env.UNSEND_API_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    NEXT_PUBLIC_PORT: process.env.NEXT_PUBLIC_PORT,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_MINIO_ENDPOINT: process.env.NEXT_PUBLIC_MINIO_ENDPOINT,
    NEXT_PUBLIC_STREAM_KEY: process.env.NEXT_PUBLIC_STREAM_KEY,
    NEXT_PUBLIC_STREAM_CONFIGURED:
      process.env.NEXT_PUBLIC_STREAM_KEY && process.env.STREAM_SECRET
        ? 'true'
        : 'false',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    STREAM_SECRET: process.env.STREAM_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,
    TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET,
  },

  skipValidation: process.env.NODE_ENV === 'production',
});
