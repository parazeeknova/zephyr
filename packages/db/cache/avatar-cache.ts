import { redis } from "../src/redis";

const AVATAR_CACHE_PREFIX = "avatar:";
const AVATAR_CACHE_TTL = 3600; // 1 hour in seconds

export interface CachedAvatarData {
  url: string;
  key: string;
  updatedAt: string;
}

export const avatarCache = {
  async get(userId: string): Promise<CachedAvatarData | null> {
    const cached = await redis.get(`${AVATAR_CACHE_PREFIX}${userId}`);
    return cached ? JSON.parse(cached) : null;
  },

  async set(userId: string, data: CachedAvatarData): Promise<void> {
    await redis.set(
      `${AVATAR_CACHE_PREFIX}${userId}`,
      JSON.stringify(data),
      "EX",
      AVATAR_CACHE_TTL
    );
  },

  async invalidate(userId: string): Promise<void> {
    await redis.del(`${AVATAR_CACHE_PREFIX}${userId}`);
  }
};
