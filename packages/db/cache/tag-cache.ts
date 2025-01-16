import prisma from "../src/prisma";
import { redis } from "../src/redis";

const TAG_COUNTS_KEY = "tags:counts";
const TAG_LIST_KEY = "tags:list";
const TAG_SUGGESTIONS_KEY = "tags:suggestions";
const TAG_TTL = 3600; // 1 hour

export interface TagCount {
  name: string;
  count: number;
}

export const tagCache = {
  async incrementTagCount(tagName: string): Promise<number> {
    try {
      const pipeline = redis.pipeline();
      pipeline.hincrby(TAG_COUNTS_KEY, tagName, 1);
      pipeline.sadd(TAG_LIST_KEY, tagName);
      pipeline.zadd(TAG_SUGGESTIONS_KEY, Date.now(), tagName);
      
      const results = await pipeline.exec();
      return (results?.[0]?.[1] as number) || 0;
    } catch (error) {
      console.error("Error incrementing tag count:", error);
      return 0;
    }
  },

  async decrementTagCount(tagName: string): Promise<number> {
    try {
      const count = await redis.hincrby(TAG_COUNTS_KEY, tagName, -1);
      if (count <= 0) {
        const pipeline = redis.pipeline();
        pipeline.hdel(TAG_COUNTS_KEY, tagName);
        pipeline.srem(TAG_LIST_KEY, tagName);
        pipeline.zrem(TAG_SUGGESTIONS_KEY, tagName);
        await pipeline.exec();
      }
      return Math.max(0, count);
    } catch (error) {
      console.error("Error decrementing tag count:", error);
      return 0;
    }
  },

  async getPopularTags(limit = 20): Promise<TagCount[]> {
    try {
      const tags = await redis.hgetall(TAG_COUNTS_KEY);
      return Object.entries(tags)
        .map(([name, count]) => ({
          name,
          count: parseInt(count as string, 10)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting popular tags:", error);
      return [];
    }
  },

  async searchTags(query: string, limit = 10): Promise<string[]> {
  try {
    // First try cache
    let tags = await redis.smembers(TAG_LIST_KEY);
    
    if (!tags || tags.length === 0) {
      // If cache is empty, fetch from DB
      const dbTags = await prisma.tag.findMany({
        where: {
          name: {
            contains: query.toLowerCase(),
            mode: 'insensitive'
          }
        },
        take: limit,
        orderBy: {
          useCount: 'desc'
        }
      });
      
      tags = dbTags.map(t => t.name);
      
      // Update cache
      if (tags.length > 0) {
        await redis.sadd(TAG_LIST_KEY, ...tags);
        await redis.expire(TAG_LIST_KEY, TAG_TTL);
      }
    } else {
      // Filter cached tags
      tags = tags
        .filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit);
    }
    
    return tags;
  } catch (error) {
    console.error("Error searching tags:", error);
    return [];
  }
}};
