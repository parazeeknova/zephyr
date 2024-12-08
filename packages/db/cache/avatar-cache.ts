import { redis } from "../src/redis";

const AVATAR_CACHE_PREFIX = "avatar:";
const AVATAR_CACHE_TTL = 3600;

export interface CachedAvatarData {
  url: string;
  key: string;
  updatedAt: string;
}

export const avatarCache = {
  async get(userId: string): Promise<CachedAvatarData | null> {
    const cached = await redis.get(`${AVATAR_CACHE_PREFIX}${userId}`);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    if (process.env.NODE_ENV === 'production' && data.url) {
      data.url = data.url.replace('http://', 'https://');
    }
    return data;
  },

  async set(userId: string, data: CachedAvatarData): Promise<void> {
    const cacheData = {
      ...data,
      url: process.env.NODE_ENV === 'production' 
        ? data.url.replace('http://', 'https://')
        : data.url
    };

    await redis.set(
      `${AVATAR_CACHE_PREFIX}${userId}`,
      JSON.stringify(cacheData),
      "EX",
      AVATAR_CACHE_TTL
    );
  },

  async del(userId: string): Promise<void> {
    await redis.del(`${AVATAR_CACHE_PREFIX}${userId}`);
  },

  async refresh(userId: string): Promise<void> {
    await this.del(userId);
    const response = await fetch(`/api/users/avatar/${userId}`);
    if (response.ok) {
      const data = await response.json();
      await this.set(userId, data);
    }
  }
};
