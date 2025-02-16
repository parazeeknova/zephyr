import type { HNStory } from '@zephyr/aggregator/hackernews';

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
    type,
  }: FetchStoriesParams): Promise<HNResponse> => {
    const params: SearchParamsRecord = {
      page: page.toString(),
      limit: limit.toString(),
    };

    if (search) {
      params.search = search;
    }
    if (sort) {
      params.sort = sort;
    }
    if (type && type !== 'all') {
      params.type = type;
    }

    const response = await fetch(
      `/api/hackernews?${new URLSearchParams(params as Record<string, string>)}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch stories');
    }

    return response.json();
  },

  refreshCache: async (): Promise<{ success: boolean }> => {
    const response = await fetch('/api/hackernews', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to refresh cache');
    }

    return response.json();
  },
};
