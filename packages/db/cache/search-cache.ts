import { redis } from "../src/redis";

export interface SearchSuggestion {
  query: string;
  count: number;
}

export const searchCache = {
  async addToHistory(userId: string, query: string): Promise<void> {
    try {
      const key = `user:${userId}:search:history`;
      await redis.zadd(key, { score: Date.now(), member: query });
      // Keep only last 10 searches
      await redis.zremrangebyrank(key, 0, -11);
    } catch (error) {
      console.error("Error adding to search history:", error);
    }
  },

  async getHistory(userId: string): Promise<string[]> {
    try {
      const key = `user:${userId}:search:history`;
      return await redis.zrange(key, 0, 9, { rev: true });
    } catch (error) {
      console.error("Error getting search history:", error);
      return [];
    }
  },

  async addSuggestion(query: string): Promise<void> {
    try {
      const key = "search:suggestions";
      await redis.zincrby(key, 1, query.toLowerCase());
    } catch (error) {
      console.error("Error adding search suggestion:", error);
    }
  },

  async getSuggestions(prefix: string, limit = 5): Promise<SearchSuggestion[]> {
    try {
      const key = "search:suggestions";
      const pattern = `${prefix}*`;
      const suggestions = await redis.zscan(key, 0, {
        match: pattern,
        count: limit
      });

      return suggestions[1].reduce((acc: SearchSuggestion[], item) => {
        const [query, count] = item as unknown as [string, number];
        acc.push({ query, count: Number(count) });
        return acc;
      }, []);
    } catch (error) {
      console.error("Error getting search suggestions:", error);
      return [];
    }
  }
};

export const searchSuggestionsCache = {
  async addSuggestion(query: string): Promise<void> {
    try {
      if (!query.trim()) return;

      // Normalize the query
      const normalizedQuery = query.toLowerCase().trim();
      const key = "search:suggestions";

      // Increment the score for this query
      await redis.zincrby(key, 1, normalizedQuery);

      // Keep only top 100 suggestions
      await redis.zremrangebyrank(key, 0, -101);

      // Set expiry for the suggestions set (7 days)
      await redis.expire(key, 60 * 60 * 24 * 7);
    } catch (error) {
      console.error("Error adding search suggestion:", error);
    }
  },

  async clearHistory(userId: string): Promise<void> {
    try {
      const key = `user:${userId}:search:history`;
      await redis.del(key);
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
  },

  async getHistory(userId: string): Promise<string[]> {
    try {
      const key = `user:${userId}:search:history`;
      return await redis.zrange(key, 0, 9, { rev: true });
    } catch (error) {
      console.error("Error getting search history:", error);
      return [];
    }
  },

  async addToHistory(userId: string, query: string): Promise<void> {
    try {
      if (!query.trim()) return;

      const key = `user:${userId}:search:history`;
      const normalizedQuery = query.toLowerCase().trim();

      await redis.zadd(key, {
        score: Date.now(),
        member: normalizedQuery
      });

      // Keep only last 10 searches
      await redis.zremrangebyrank(key, 0, -11);

      // Set expiry for user's search history (30 days)
      await redis.expire(key, 60 * 60 * 24 * 30);
    } catch (error) {
      console.error("Error adding to search history:", error);
    }
  },

  async getSuggestions(prefix: string, limit = 5): Promise<SearchSuggestion[]> {
    try {
      if (!prefix.trim()) return [];

      const normalizedPrefix = prefix.toLowerCase().trim();
      const key = "search:suggestions";

      // Get all members and their scores
      const result = await redis.zrange(key, 0, -1, {
        rev: true,
        withScores: true
      });

      // Convert the result to pairs of [query, score]
      const pairs: Array<[string, number]> = [];
      for (let i = 0; i < result.length; i += 2) {
        pairs.push([result[i] as string, Number(result[i + 1])]);
      }

      // Filter and format suggestions
      const filteredSuggestions = pairs
        .filter(([query]) => query.startsWith(normalizedPrefix))
        .slice(0, limit)
        .map(([query, score]) => ({
          query,
          count: score
        }));

      return filteredSuggestions;
    } catch (error) {
      console.error("Error getting search suggestions:", error);
      return [];
    }
  }
};

export interface SearchSuggestion {
  query: string;
  count: number;
}
