import ky from "@/lib/ky";
import type { HNStory } from "@zephyr/aggregator/hackernews";

export interface FetchStoriesParams {
  page: number;
  limit: number;
  search?: string;
  sort?: string;
  type?: string;
}

export interface HNResponse {
  stories: HNStory[];
  hasMore: boolean;
  total: number;
}

type SearchParamsRecord = Record<string, string | number | boolean>;

export const hackerNewsMutations = {
  fetchStories: async ({
    page,
    limit,
    search,
    sort,
    type
  }: FetchStoriesParams): Promise<HNResponse> => {
    const params: SearchParamsRecord = {
      page: page.toString(),
      limit: limit.toString()
    };

    if (search) params.search = search;
    if (sort) params.sort = sort;
    if (type && type !== "all") params.type = type;

    return ky
      .get("/api/hackernews", {
        searchParams: params,
        retry: {
          limit: 2,
          methods: ["GET"],
          statusCodes: [408, 429, 500, 502, 503, 504]
        }
      })
      .json();
  },

  refreshCache: async (): Promise<{ success: boolean }> => {
    return ky
      .post("/api/hackernews", {
        retry: {
          limit: 2,
          methods: ["POST"],
          statusCodes: [408, 429, 500, 502, 503, 504]
        }
      })
      .json();
  }
};
