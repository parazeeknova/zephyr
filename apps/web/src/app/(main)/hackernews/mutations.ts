import ky from "@/lib/ky";
import type { HNStory } from "@zephyr/db";

export interface FetchStoriesParams {
  page: number;
  limit: number;
  search?: string;
  sort?: string;
  type?: string;
}

type SearchParamsRecord = Record<string, string | number | boolean>;

export const hackerNewsMutations = {
  fetchStories: async ({
    page,
    limit,
    search,
    sort,
    type
  }: FetchStoriesParams): Promise<{ stories: HNStory[] }> => {
    const params: SearchParamsRecord = {
      page: page.toString(),
      limit: limit.toString()
    };

    if (search) params.search = search;
    if (sort) params.sort = sort;
    if (type && type !== "all") params.type = type;

    return ky
      .get("/api/hackernews", {
        searchParams: params
      })
      .json();
  },

  refreshCache: async (): Promise<{ success: boolean }> => {
    return ky.post("/api/hackernews").json();
  }
};
