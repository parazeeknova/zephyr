import { FollowerInfo } from "../src/client";
import { redis } from "../src/redis";
import { CACHE_KEYS } from "../constants/cache-keys";
import { debugLog } from "@zephyr/config/debug";

export const followerInfoCache = {
  async get(userId: string): Promise<FollowerInfo | null> {
    try {
      const cacheKey = CACHE_KEYS.followerInfo(userId);
      debugLog.cache('Getting from cache:', cacheKey);
      
      const data = await redis.get(cacheKey);
      if (data) {
        debugLog.cache('Primary cache hit:', { userId, data });
        return JSON.parse(data);
      }

      const backupData = await redis.get(`${cacheKey}:backup`);
      if (backupData) {
        const parsed = JSON.parse(backupData);
        debugLog.cache('Backup cache hit:', { userId, data: parsed });
        await this.set(userId, parsed.data);
        return parsed.data;
      }
      
      debugLog.cache('Cache miss:', userId);
      return null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  },

  async set(userId: string, data: FollowerInfo): Promise<void> {
    try {
      const cacheKey = CACHE_KEYS.followerInfo(userId);
      const cacheData = JSON.stringify(data);
      const backupData = JSON.stringify({
        data,
        timestamp: Date.now()
      });

      debugLog.cache('Setting cache:', { key: cacheKey, data });
      
      await Promise.all([
        // Primary cache - 5 minutes
        redis.set(cacheKey, cacheData, 'EX', 300),
        // Backup cache - 1 hour
        redis.set(`${cacheKey}:backup`, backupData, 'EX', 3600),
        // Store in user's followed list - 24 hours
        data.isFollowedByUser ? 
          redis.sadd(`user:${userId}:followers`, userId) :
          redis.srem(`user:${userId}:followers`, userId)
      ]);
    } catch (error) {
      console.error("Cache set error:", error);
    }
  },

  async invalidate(userId: string): Promise<void> {
    try {
      const keys = [
        CACHE_KEYS.followerInfo(userId),
        `${CACHE_KEYS.followerInfo(userId)}:backup`,
        CACHE_KEYS.suggestedUsers(userId),
        CACHE_KEYS.user(userId),
        CACHE_KEYS.userProfile(userId)
      ];
      
      debugLog.cache('Invalidating cache keys:', keys);
      await Promise.all(keys.map(key => redis.del(key)));
    } catch (error) {
      console.error("Cache invalidation error:", error);
    }
  }
};

