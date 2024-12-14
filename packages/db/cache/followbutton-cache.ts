import { FollowerInfo } from "../src/client";
import { redis } from "../src/redis";

export const followerInfoCache = {
  async get(userId: string): Promise<FollowerInfo | null> {
    try {
      const data = await redis.get(`follower:${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting follower info from cache:", error);
      return null;
    }
  },

  async set(userId: string, data: FollowerInfo): Promise<void> {
    try {
      await redis.set(
        `follower:${userId}`,
        JSON.stringify(data),
        'EX',
        300
      );
    } catch (error) {
      console.error("Error setting follower info cache:", error);
    }
  },

  async invalidate(userId: string): Promise<void> {
    try {
      await Promise.all([
        redis.del(`follower:${userId}`),
        redis.del(`suggested-users:${userId}`)
      ]);
    } catch (error) {
      console.error("Error invalidating follower info cache:", error);
    }
  }
};
