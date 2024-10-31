import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ""
});

export interface TrendingTopic {
  hashtag: string;
  count: number;
}

const TRENDING_TOPICS_KEY = "trending:topics";
const TRENDING_TOPICS_BACKUP_KEY = "trending:topics:backup";
const CACHE_TTL = 3600; // 1 hour in seconds
const BACKUP_TTL = 86400; // 24 hours in seconds

export const trendingTopicsCache = {
  async get(): Promise<TrendingTopic[]> {
    try {
      // Upstash automatically handles JSON serialization
      return (await redis.get<TrendingTopic[]>(TRENDING_TOPICS_KEY)) || [];
    } catch (error) {
      console.error("Error getting trending topics from cache:", error);
      return this.getBackup();
    }
  },

  async getBackup(): Promise<TrendingTopic[]> {
    try {
      // Upstash automatically handles JSON serialization
      return (
        (await redis.get<TrendingTopic[]>(TRENDING_TOPICS_BACKUP_KEY)) || []
      );
    } catch (error) {
      console.error("Error getting trending topics backup:", error);
      return [];
    }
  },

  async set(topics: TrendingTopic[]): Promise<void> {
    try {
      // Store directly, Upstash handles serialization
      await redis.set(TRENDING_TOPICS_KEY, topics, { ex: CACHE_TTL });
      await redis.set(TRENDING_TOPICS_BACKUP_KEY, topics, { ex: BACKUP_TTL });
      await redis.set(`${TRENDING_TOPICS_KEY}:last_updated`, Date.now(), {
        ex: BACKUP_TTL
      });
    } catch (error) {
      console.error("Error setting trending topics cache:", error);
    }
  },

  async invalidate(): Promise<void> {
    try {
      await redis.del(TRENDING_TOPICS_KEY);
    } catch (error) {
      console.error("Error invalidating trending topics cache:", error);
    }
  },

  async shouldRefresh(): Promise<boolean> {
    try {
      const lastUpdated = await redis.get<number>(
        `${TRENDING_TOPICS_KEY}:last_updated`
      );
      if (!lastUpdated) return true;

      const timeSinceUpdate = Date.now() - lastUpdated;
      return timeSinceUpdate > (CACHE_TTL * 1000) / 2;
    } catch {
      return true;
    }
  },

  async warmCache(): Promise<void> {
    try {
      const shouldWarm = await this.shouldRefresh();
      if (!shouldWarm) return;
      await this.refreshCache();
    } catch (error) {
      console.error("Error warming trending topics cache:", error);
    }
  },

  refreshCache: null as unknown as () => Promise<TrendingTopic[]>
};
