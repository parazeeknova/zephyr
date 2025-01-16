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
  async syncTagCounts(): Promise<void> {
    try {
      const tags = await prisma.tag.findMany({
        select: {
          name: true,
          _count: {
            select: { posts: true }
          }
        }
      });

      const pipeline = redis.pipeline();
      
      pipeline.del(TAG_COUNTS_KEY);
      pipeline.del(TAG_LIST_KEY);
      
      for (const tag of tags) {
        if (tag._count.posts > 0) {
          pipeline.hset(TAG_COUNTS_KEY, tag.name, tag._count.posts.toString());
          pipeline.sadd(TAG_LIST_KEY, tag.name);
          pipeline.zadd(TAG_SUGGESTIONS_KEY, tag._count.posts, tag.name);
        }
      }
      
      await pipeline.exec();
      await redis.expire(TAG_COUNTS_KEY, TAG_TTL);
      await redis.expire(TAG_LIST_KEY, TAG_TTL);
      await redis.expire(TAG_SUGGESTIONS_KEY, TAG_TTL);
    } catch (error) {
      console.error("Error syncing tag counts:", error);
    }
  },

  async incrementTagCount(tagName: string): Promise<number> {
    try {
      const pipeline = redis.pipeline();
      pipeline.hincrby(TAG_COUNTS_KEY, tagName, 1);
      pipeline.sadd(TAG_LIST_KEY, tagName);
      pipeline.zadd(TAG_SUGGESTIONS_KEY, Date.now(), tagName);
      
      await prisma.tag.upsert({
        where: { name: tagName },
        create: { name: tagName, useCount: 1 },
        update: { useCount: { increment: 1 } }
      });
      
      const results = await pipeline.exec();
      return (results?.[0]?.[1] as number) || 0;
    } catch (error) {
      console.error("Error incrementing tag count:", error);
      return 0;
    }
  },

  async decrementTagCount(tagName: string): Promise<number> {
    try {
      const pipeline = redis.pipeline();
      const count = await redis.hincrby(TAG_COUNTS_KEY, tagName, -1);
      
      await prisma.tag.update({
        where: { name: tagName },
        data: { useCount: { decrement: 1 } }
      });

      if (count <= 0) {
        pipeline.hdel(TAG_COUNTS_KEY, tagName);
        pipeline.srem(TAG_LIST_KEY, tagName);
        pipeline.zrem(TAG_SUGGESTIONS_KEY, tagName);
        await pipeline.exec();
        
        await prisma.tag.deleteMany({
          where: {
            name: tagName,
            useCount: 0,
            posts: { none: {} }
          }
        });
      }
      
      return Math.max(0, count);
    } catch (error) {
      console.error("Error decrementing tag count:", error);
      return 0;
    }
  },

  async getPopularTags(limit = 20): Promise<TagCount[]> {
    try {
      let tags = await redis.hgetall(TAG_COUNTS_KEY);
      
      if (!tags || Object.keys(tags).length === 0) {
        await this.syncTagCounts();
        tags = await redis.hgetall(TAG_COUNTS_KEY);
      }

      return Object.entries(tags)
        .map(([name, count]) => ({
          name,
          count: parseInt(count as string, 10)
        }))
        .filter(tag => tag.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting popular tags:", error);
      return [];
    }
  },

  async searchTags(query: string, limit = 10): Promise<string[]> {
    try {
      let tags = await redis.smembers(TAG_LIST_KEY);
      
      if (!tags || tags.length === 0) {
        await this.syncTagCounts();
        tags = await redis.smembers(TAG_LIST_KEY);
        
        if (!tags || tags.length === 0) {
          const dbTags = await prisma.tag.findMany({
            where: {
              name: {
                contains: query.toLowerCase(),
                mode: 'insensitive'
              },
              useCount: { gt: 0 }
            },
            take: limit,
            orderBy: {
              useCount: 'desc'
            }
          });
          
          tags = dbTags.map(t => t.name);
          
          if (tags.length > 0) {
            await redis.sadd(TAG_LIST_KEY, ...tags);
            await redis.expire(TAG_LIST_KEY, TAG_TTL);
          }
        }
      }
      
      return tags
        .filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit);
    } catch (error) {
      console.error("Error searching tags:", error);
      return [];
    }
  },

  async refreshCache(): Promise<void> {
    try {
      await this.syncTagCounts();
    } catch (error) {
      console.error("Error refreshing tag cache:", error);
    }
  }
};
