import { redis } from '@zephyr/db';

const RATE_LIMIT_PREFIX = 'ratelimit:hn:';
const WINDOW_SIZE = 60;
const MAX_REQUESTS = 30;

export async function checkRateLimit(identifier: string): Promise<boolean> {
  const key = `${RATE_LIMIT_PREFIX}${identifier}`;
  const currentTime = Math.floor(Date.now() / 1000);
  const windowStart = currentTime - WINDOW_SIZE;

  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart);
  pipeline.zadd(key, currentTime, `${currentTime}`);
  pipeline.zcard(key);
  pipeline.expire(key, WINDOW_SIZE);

  const results = await pipeline.exec();
  const requestCount = results?.[2]?.[1] as number;

  return requestCount <= MAX_REQUESTS;
}
