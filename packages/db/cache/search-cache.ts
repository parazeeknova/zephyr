import { redis } from "../src/redis";

export interface SearchSuggestion {
  query: string;
  count: number;
}

const SEARCH_HISTORY_TTL = 60 * 60 * 24 * 30; // 30 days
const SUGGESTIONS_TTL = 60 * 60 * 24 * 7; // 7 days
const MAX_HISTORY_ITEMS = 10;
const MAX_SUGGESTIONS = 100;

export const searchSuggestionsCache = {
  async addSuggestion(query: string): Promise<void> {
    try {
      if (!query.trim()) return;

      const normalizedQuery = query.toLowerCase().trim();
      const key = "search:suggestions";

      const pipeline = redis.pipeline();
      pipeline.zincrby(key, 1, normalizedQuery);
      pipeline.zremrangebyrank(key, 0, -MAX_SUGGESTIONS - 1);
      pipeline.expire(key, SUGGESTIONS_TTL);

      await pipeline.exec();
    } catch (error) {
      console.error("Error adding search suggestion:", error);
    }
  },

  async getSuggestions(prefix: string, limit = 5): Promise<SearchSuggestion[]> {
    try {
      if (!prefix.trim()) return [];

      const normalizedPrefix = prefix.toLowerCase().trim();
      const key = "search:suggestions";

      const results = await redis.zrevrange(key, 0, -1, 'WITHSCORES');
      const suggestions: SearchSuggestion[] = [];
      for (let i = 0; i < results.length; i += 2) {
        const query = results[i];
        const count = parseInt(results[i + 1] || '0', 10);
        
        if (query.startsWith(normalizedPrefix)) {
          suggestions.push({ query, count });
          if (suggestions.length >= limit) break;
        }
      }

      return suggestions;
    } catch (error) {
      console.error("Error getting search suggestions:", error);
      return [];
    }
  },

  async addToHistory(userId: string, query: string): Promise<void> {
    try {
      if (!query.trim()) return;

      const key = `user:${userId}:search:history`;
      const normalizedQuery = query.toLowerCase().trim();

      const pipeline = redis.pipeline();

      pipeline.zadd(key, Date.now(), normalizedQuery);
      pipeline.zremrangebyrank(key, 0, -MAX_HISTORY_ITEMS - 1);
      pipeline.expire(key, SEARCH_HISTORY_TTL);

      await pipeline.exec();
    } catch (error) {
      console.error("Error adding to search history:", error);
    }
  },

  async getHistory(userId: string): Promise<string[]> {
    try {
      const key = `user:${userId}:search:history`;
      return await redis.zrevrange(key, 0, MAX_HISTORY_ITEMS - 1);
    } catch (error) {
      console.error("Error getting search history:", error);
      return [];
    }
  },

  async clearHistory(userId: string): Promise<void> {
    try {
      await redis.del(`user:${userId}:search:history`);
    } catch (error) {
      console.error("Error clearing search history:", error);
    }
  },

  async removeHistoryItem(userId: string, query: string): Promise<void> {
    try {
      const key = `user:${userId}:search:history`;
      await redis.zrem(key, query);
    } catch (error) {
      console.error("Error removing history item:", error);
    }
  }
};

export const searchCache = {
  addToHistory: searchSuggestionsCache.addToHistory,
  getHistory: searchSuggestionsCache.getHistory,
  addSuggestion: searchSuggestionsCache.addSuggestion,
  getSuggestions: searchSuggestionsCache.getSuggestions
};
