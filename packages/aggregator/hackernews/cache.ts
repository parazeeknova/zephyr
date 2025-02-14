import { redis } from '@zephyr/db';
import type { HNStory } from './types';

const HN_CACHE_PREFIX = 'hn:';
const HN_STORIES_KEY = `${HN_CACHE_PREFIX}stories`;
const HN_STORY_KEY_PREFIX = `${HN_CACHE_PREFIX}story:`;
const CACHE_TTL = 900; // 15 minutes
const BACKUP_TTL = 3600; // 1 hour for backup/stale data

export const hackerNewsCache = {
  async getStories(): Promise<number[]> {
    try {
      // Try getting from primary cache
      const stories = await redis.get(HN_STORIES_KEY);
      if (stories) {
        return JSON.parse(stories);
      }

      // Try backup if primary fails
      const backupStories = await redis.get(`${HN_STORIES_KEY}:backup`);
      return backupStories ? JSON.parse(backupStories) : [];
    } catch (error) {
      console.error('Error getting HN stories from cache:', error);
      return [];
    }
  },

  async setStories(storyIds: number[]): Promise<void> {
    try {
      const pipeline = redis.pipeline();

      // Set primary cache
      pipeline.set(HN_STORIES_KEY, JSON.stringify(storyIds), 'EX', CACHE_TTL);

      // Set backup cache
      pipeline.set(
        `${HN_STORIES_KEY}:backup`,
        JSON.stringify(storyIds),
        'EX',
        BACKUP_TTL
      );

      // Set last updated timestamp
      pipeline.set(
        `${HN_STORIES_KEY}:last_updated`,
        Date.now(),
        'EX',
        CACHE_TTL
      );

      await pipeline.exec();
    } catch (error) {
      console.error('Error setting HN stories cache:', error);
    }
  },

  async getStory(id: number): Promise<HNStory | null> {
    try {
      // Try primary cache
      const story = await redis.get(`${HN_STORY_KEY_PREFIX}${id}`);
      if (story) {
        return JSON.parse(story);
      }

      // Try backup if primary fails
      const backupStory = await redis.get(`${HN_STORY_KEY_PREFIX}${id}:backup`);
      return backupStory ? JSON.parse(backupStory) : null;
    } catch (error) {
      console.error(`Error getting HN story ${id} from cache:`, error);
      return null;
    }
  },

  async setStory(story: HNStory): Promise<void> {
    try {
      const pipeline = redis.pipeline();
      const storyStr = JSON.stringify(story);

      // Set primary cache
      pipeline.set(
        `${HN_STORY_KEY_PREFIX}${story.id}`,
        storyStr,
        'EX',
        CACHE_TTL
      );

      // Set backup cache
      pipeline.set(
        `${HN_STORY_KEY_PREFIX}${story.id}:backup`,
        storyStr,
        'EX',
        BACKUP_TTL
      );

      await pipeline.exec();
    } catch (error) {
      console.error(`Error setting HN story ${story.id} cache:`, error);
    }
  },

  async getMultipleStories(ids: number[]): Promise<Record<number, HNStory>> {
    try {
      const pipeline = redis.pipeline();

      // Get from both primary and backup cache
      for (const id of ids) {
        pipeline.get(`${HN_STORY_KEY_PREFIX}${id}`);
        pipeline.get(`${HN_STORY_KEY_PREFIX}${id}:backup`);
      }

      const results = await pipeline.exec();
      const stories: Record<number, HNStory> = {};

      ids.forEach((id, index) => {
        const primaryIdx = index * 2;
        const backupIdx = primaryIdx + 1;

        const primary = results?.[primaryIdx]?.[1] as string | null;
        const backup = results?.[backupIdx]?.[1] as string | null;

        if (primary) {
          stories[id] = JSON.parse(primary);
        } else if (backup) {
          stories[id] = JSON.parse(backup);
        }
      });

      return stories;
    } catch (error) {
      console.error('Error getting multiple HN stories from cache:', error);
      return {};
    }
  },

  async shouldRefresh(): Promise<boolean> {
    try {
      const lastUpdated = await redis.get(`${HN_STORIES_KEY}:last_updated`);
      if (!lastUpdated) {
        return true;
      }
      const timeSinceUpdate = Date.now() - Number.parseInt(lastUpdated);
      return timeSinceUpdate > (CACHE_TTL * 1000) / 2;
    } catch {
      return true;
    }
  },

  async invalidateStories(): Promise<void> {
    try {
      const pipeline = redis.pipeline();

      // Get all keys with the HN prefix
      const keys = await redis.keys(`${HN_CACHE_PREFIX}*`);

      // Add del commands to pipeline
      if (keys.length > 0) {
        pipeline.del(...keys);
      }

      await pipeline.exec();
      console.log('Invalidated HN cache');
    } catch (error) {
      console.error('Error invalidating HN cache:', error);
    }
  },
};
