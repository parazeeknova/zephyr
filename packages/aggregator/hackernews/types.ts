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

export interface FetchStoriesOptions {
  page: number;
  limit: number;
  search?: string;
  sort?: string;
  type?: string;
  identifier?: string;
}

export interface HNApiResponse {
  stories: HNStory[];
  hasMore: boolean;
  total: number;
}

export class HackerNewsError extends Error {
  constructor(
    message: string,
    // biome-ignore lint/style/noParameterProperties: ignore
    // biome-ignore lint/nursery/useConsistentMemberAccessibility: ignore
    public statusCode = 500,
    // biome-ignore lint/style/noParameterProperties: ignore
    // biome-ignore lint/nursery/useConsistentMemberAccessibility: ignore
    public context?: unknown
  ) {
    super(message);
    this.name = 'HackerNewsError';
  }
}
