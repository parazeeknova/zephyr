import { redis } from "../src/redis";

const SHARE_STATS_PREFIX = "share:stats:";
const SHARE_CLICKS_PREFIX = "share:clicks:";

export const shareStatsCache = {
  async incrementShare(postId: string, platform: string): Promise<number> {
    try {
      const key = `${SHARE_STATS_PREFIX}${postId}:${platform}`;
      const result = await redis.incr(key);
      await redis.expire(key, 86400);
      return result;
    } catch (error) {
      console.error("Error incrementing share count:", error);
      return 0;
    }
  },

  async incrementClick(postId: string, platform: string): Promise<number> {
    try {
      const key = `${SHARE_CLICKS_PREFIX}${postId}:${platform}`;
      const result = await redis.incr(key);
      await redis.expire(key, 86400); 
      return result;
    } catch (error) {
      console.error("Error incrementing click count:", error);
      return 0;
    }
  },

  async getStats(postId: string, platform: string): Promise<{shares: number; clicks: number}> {
    try {
      const pipeline = redis.pipeline();
      pipeline.get(`${SHARE_STATS_PREFIX}${postId}:${platform}`);
      pipeline.get(`${SHARE_CLICKS_PREFIX}${postId}:${platform}`);
      const results = await pipeline.exec();

      return {
        shares: parseInt((results?.[0]?.[1] as string) || '0'),
        clicks: parseInt((results?.[1]?.[1] as string) || '0')
      };
    } catch (error) {
      console.error("Error getting share stats:", error);
      return { shares: 0, clicks: 0 };
    }
  }
};
