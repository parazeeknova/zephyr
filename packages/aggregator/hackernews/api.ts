import ky from "ky";
import { hackerNewsCache } from "./cache";
import { checkRateLimit } from "./rate-limiter";
import {
  type FetchStoriesOptions,
  type HNApiResponse,
  type HNStory,
  HackerNewsError
} from "./types";

const HN_API_BASE = "https://hacker-news.firebaseio.com/v0";
const DEFAULT_TIMEOUT = 5000;

export class HackerNewsAPI {
  private client: typeof ky;

  constructor() {
    this.client = ky.create({
      prefixUrl: HN_API_BASE,
      timeout: DEFAULT_TIMEOUT,
      retry: {
        limit: 3,
        methods: ["GET"],
        statusCodes: [408, 429, 500, 502, 503, 504]
      }
    });
  }

  private async fetchWithRateLimit(
    identifier: string,
    fn: () => Promise<any>
  ): Promise<any> {
    const canProceed = await checkRateLimit(identifier);
    if (!canProceed) {
      throw new HackerNewsError("Rate limit exceeded", 429);
    }
    return fn();
  }

  async fetchTopStories(): Promise<number[]> {
    try {
      const cachedStories = await hackerNewsCache.getStories();
      if (cachedStories.length > 0) {
        return cachedStories;
      }

      const stories = await this.fetchWithRateLimit("topstories", () =>
        this.client.get("topstories.json").json<number[]>()
      );

      await hackerNewsCache.setStories(stories);
      return stories;
    } catch (error) {
      if (error instanceof HackerNewsError) {
        throw error;
      }
      throw new HackerNewsError(
        "Failed to fetch top stories",
        (error as any)?.response?.status
      );
    }
  }

  async fetchStory(id: number): Promise<HNStory> {
    try {
      const cachedStory = await hackerNewsCache.getStory(id);
      if (cachedStory) {
        return cachedStory;
      }

      const story = await this.fetchWithRateLimit(`story:${id}`, () =>
        this.client.get(`item/${id}.json`).json<HNStory>()
      );

      if (!story) {
        throw new HackerNewsError(`Story ${id} not found`, 404);
      }

      await hackerNewsCache.setStory(story);
      return story;
    } catch (error) {
      if (error instanceof HackerNewsError) {
        throw error;
      }
      throw new HackerNewsError(
        `Failed to fetch story ${id}`,
        (error as any)?.response?.status
      );
    }
  }

  async fetchStories({
    page,
    limit,
    search,
    sort = "score",
    type = "all",
    identifier = "anonymous"
  }: FetchStoriesOptions): Promise<HNApiResponse> {
    try {
      if (identifier) {
        const canProceed = await checkRateLimit(identifier);
        if (!canProceed) {
          throw new HackerNewsError("Rate limit exceeded", 429);
        }
      }

      const allStories = await this.fetchTopStories();
      const start = page * limit;
      const end = start + limit;
      const pageIds = allStories.slice(start, end);

      const cachedStories = await hackerNewsCache.getMultipleStories(pageIds);
      const missingIds = pageIds.filter((id) => !cachedStories[id]);

      const newStories = await Promise.all(
        missingIds.map((id) => this.fetchStory(id))
      );

      let stories = [...Object.values(cachedStories), ...newStories];

      if (type !== "all") {
        stories = stories.filter((story) => story.type === type);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        stories = stories.filter(
          (story) =>
            story.title.toLowerCase().includes(searchLower) ||
            story.by.toLowerCase().includes(searchLower)
        );
      }

      stories.sort((a, b) => {
        switch (sort) {
          case "time":
            return b.time - a.time;
          case "comments":
            return b.descendants - a.descendants;
          default:
            return b.score - a.score;
        }
      });

      return {
        stories,
        hasMore: end < allStories.length,
        total: allStories.length
      };
    } catch (error) {
      if (error instanceof HackerNewsError) {
        throw error;
      }
      throw new HackerNewsError(
        "Failed to fetch stories",
        (error as any)?.response?.status
      );
    }
  }

  async refreshCache(): Promise<void> {
    try {
      await hackerNewsCache.invalidateStories();
      const stories = await this.fetchTopStories();
      const firstPageIds = stories.slice(0, 30);
      await Promise.all(firstPageIds.map((id) => this.fetchStory(id)));
    } catch (error) {
      throw new HackerNewsError(
        "Failed to refresh cache",
        (error as any)?.response?.status
      );
    }
  }
}

export const hackerNewsAPI = new HackerNewsAPI();
