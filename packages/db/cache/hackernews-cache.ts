import { redis } from "../src/redis";

const HN_CACHE_PREFIX = "hn:";
const HN_STORIES_KEY = `${HN_CACHE_PREFIX}stories`;
const HN_STORY_KEY_PREFIX = `${HN_CACHE_PREFIX}story:`;
const CACHE_TTL = 900; // 15 minutes in seconds

export interface HNStory {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
  time: number;
  descendants: number;
  type: string;
}

export const hackerNewsCache = {
  async getStories(): Promise<number[]> {
    try {
      const stories = await redis.get(HN_STORIES_KEY);
      return stories ? JSON.parse(stories) : [];
    } catch (error) {
      console.error("Error getting HN stories from cache:", error);
      return [];
    }
  },

  async setStories(storyIds: number[]): Promise<void> {
    try {
      await redis.set(
        HN_STORIES_KEY,
        JSON.stringify(storyIds),
        "EX",
        CACHE_TTL
      );
    } catch (error) {
      console.error("Error setting HN stories cache:", error);
    }
  },

  async getStory(id: number): Promise<HNStory | null> {
    try {
      const story = await redis.get(`${HN_STORY_KEY_PREFIX}${id}`);
      return story ? JSON.parse(story) : null;
    } catch (error) {
      console.error("Error getting HN story from cache:", error);
      return null;
    }
  },

  async setStory(story: HNStory): Promise<void> {
    try {
      await redis.set(
        `${HN_STORY_KEY_PREFIX}${story.id}`,
        JSON.stringify(story),
        "EX",
        CACHE_TTL
      );
    } catch (error) {
      console.error("Error setting HN story cache:", error);
    }
  },

  async getMultipleStories(ids: number[]): Promise<Record<number, HNStory>> {
    try {
      const pipeline = redis.pipeline();
      for (const id of ids) {
        pipeline.get(`${HN_STORY_KEY_PREFIX}${id}`);
      }

      const results = await pipeline.exec();
      return ids.reduce((acc, id, index) => {
        const story = results?.[index]?.[1] as string;
        if (story) {
          acc[id] = JSON.parse(story);
        }
        return acc;
      }, {} as Record<number, HNStory>);
    } catch (error) {
      console.error("Error getting multiple HN stories from cache:", error);
      return {};
    }
  },

  async invalidateStories(): Promise<void> {
    try {
      await redis.del(HN_STORIES_KEY);
    } catch (error) {
      console.error("Error invalidating HN stories cache:", error);
    }
  },

  async invalidateStory(id: number): Promise<void> {
    try {
      await redis.del(`${HN_STORY_KEY_PREFIX}${id}`);
    } catch (error) {
      console.error("Error invalidating HN story cache:", error);
    }
  }
};
