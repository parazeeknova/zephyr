import { redis } from '@zephyr/db';
import { NextResponse } from 'next/server';

export class RateLimiter {
  private prefix: string;
  private maxRequests: number;
  private windowMs: number;

  constructor(prefix: string, maxRequests: number, windowMs: number) {
    this.prefix = prefix;
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  private getKey(identifier: string): string {
    return `${this.prefix}:${identifier}`;
  }

  async isRateLimited(identifier: string): Promise<{
    limited: boolean;
    remaining: number;
    resetIn: number;
  }> {
    const key = this.getKey(identifier);
    const now = Date.now();
    const windowStart = now - this.windowMs;

    await redis.zremrangebyscore(key, 0, windowStart);

    const requestCount = await redis.zcard(key);

    if (requestCount >= this.maxRequests) {
      const oldestTimestamp = await redis.zrange(key, 0, 0, 'WITHSCORES');
      const resetIn = oldestTimestamp[1]
        ? Number(oldestTimestamp[1]) + this.windowMs - now
        : this.windowMs;

      return {
        limited: true,
        remaining: 0,
        resetIn: Math.ceil(resetIn / 1000), // Convert to seconds
      };
    }

    // Add new request
    await redis.zadd(key, now, `${now}-${Math.random()}`);
    await redis.expire(key, Math.ceil(this.windowMs / 1000));

    return {
      limited: false,
      remaining: this.maxRequests - requestCount - 1,
      resetIn: this.windowMs / 1000,
    };
  }
}

export async function rateLimitMiddleware(
  // biome-ignore lint/correctness/noUnusedVariables: "Request" is used in the function signature
  request: Request,
  identifier: string,
  maxRequests = 5,
  windowMs = 60000
) {
  const limiter = new RateLimiter('ratelimit:support', maxRequests, windowMs);
  const { limited, remaining, resetIn } =
    await limiter.isRateLimited(identifier);

  if (limited) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        resetIn,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': resetIn.toString(),
        },
      }
    );
  }

  return null;
}
