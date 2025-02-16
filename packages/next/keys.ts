// @ts-expect-error - This file is not a module
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = createEnv({
  server: {
    ANALYZE: z.enum(['true', 'false']).optional().default('false'),
    NEXT_PRIVATE_SKIP_VALIDATION: z.enum(['true', 'false']).default('false'),
    NEXT_TELEMETRY_DISABLED: z.enum(['1', '0']).optional().default('0'),
    TURBO_TELEMETRY_DISABLED: z.enum(['1', '0']).optional().default('0'),
    NEXT_RUNTIME: z.enum(['nodejs', 'edge']).optional(),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    NEXT_PRIVATE_DEBUG: z.string().optional(),
    STREAM_SECRET: z.string().optional(),
    MINIO_BUCKET_NAME: z.string().default('uploads'),
  },
  client: {
    NEXT_PUBLIC_VERCEL_ENV: z
      .enum(['development', 'preview', 'production'])
      .default('development'),
    NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
    NEXT_PUBLIC_MINIO_ENDPOINT: z
      .string()
      .url()
      .default('http://localhost:9001'),
    NEXT_PUBLIC_STREAM_KEY: z.string().optional(),
    NEXT_PUBLIC_STREAM_CONFIGURED: z.enum(['true', 'false']).default('false'),
  },
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    NEXT_PRIVATE_SKIP_VALIDATION: process.env.NEXT_PRIVATE_SKIP_VALIDATION,
    NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED,
    TURBO_TELEMETRY_DISABLED: process.env.TURBO_TELEMETRY_DISABLED,
    NEXT_PRIVATE_DEBUG: process.env.NEXT_PRIVATE_DEBUG,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    NODE_ENV: process.env.NODE_ENV,
    STREAM_SECRET: process.env.STREAM_SECRET,
    MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME,
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_MINIO_ENDPOINT: process.env.NEXT_PUBLIC_MINIO_ENDPOINT,
    NEXT_PUBLIC_STREAM_KEY: process.env.NEXT_PUBLIC_STREAM_KEY,
    NEXT_PUBLIC_STREAM_CONFIGURED:
      process.env.NEXT_PUBLIC_STREAM_KEY && process.env.STREAM_SECRET
        ? 'true'
        : 'false',
  },
  skipValidation: process.env.NODE_ENV === 'production',
});
