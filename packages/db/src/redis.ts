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

export const POST_VIEWS_KEY_PREFIX = "post:views:";
export const POST_VIEWS_SET = "posts:with:views";

export const postViewsCache = {
  async incrementView(postId: string): Promise<number> {
    try {
      const pipeline = redis.pipeline();

      // Add post to set of posts with views
      pipeline.sadd(POST_VIEWS_SET, postId);
      // Increment view count
      pipeline.incr(`${POST_VIEWS_KEY_PREFIX}${postId}`);

      const results = await pipeline.exec();
      return Number(results[1]) || 0; // Return the result of INCR operation
    } catch (error) {
      console.error("Error incrementing post view:", error);
      return 0;
    }
  },

  async getViews(postId: string): Promise<number> {
    try {
      const views = await redis.get<number>(
        `${POST_VIEWS_KEY_PREFIX}${postId}`
      );
      return views || 0;
    } catch (error) {
      console.error("Error getting post views:", error);
      return 0;
    }
  },

  async getMultipleViews(postIds: string[]): Promise<Record<string, number>> {
    try {
      const pipeline = redis.pipeline();
      for (const id of postIds) {
        pipeline.get(`${POST_VIEWS_KEY_PREFIX}${id}`);
      }

      const results = await pipeline.exec();

      return postIds.reduce(
        (acc, id, index) => {
          acc[id] = Number(results[index]) || 0;
          return acc;
        },
        {} as Record<string, number>
      );
    } catch (error) {
      console.error("Error getting multiple post views:", error);
      return {};
    }
  },

  async isInViewSet(postId: string): Promise<boolean> {
    try {
      return (await redis.sismember(POST_VIEWS_SET, postId)) === 1;
    } catch (error) {
      console.error("Error checking post in view set:", error);
      return false;
    }
  }
};
