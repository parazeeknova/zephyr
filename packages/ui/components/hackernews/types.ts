export interface HNStoryType {
  id: number;
  title: string;
  url?: string;
  by: string;
  time: number;
  score: number;
  descendants: number;
}

export interface HNApiResponse {
  stories: HNStoryType[];
  hasMore: boolean;
  total: number;
}
