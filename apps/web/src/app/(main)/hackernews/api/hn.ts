import ky from "@/lib/ky";
import { type HNStory, hackerNewsCache } from "@zephyr/db";

const HN_API_BASE = "https://hacker-news.firebaseio.com/v0";

export async function fetchTopStories(): Promise<number[]> {
  const cachedStories = await hackerNewsCache.getStories();
  if (cachedStories.length > 0) {
    return cachedStories;
  }

  const stories = await ky
    .get(`${HN_API_BASE}/topstories.json`)
    .json<number[]>();
  await hackerNewsCache.setStories(stories);
  return stories;
}

export async function fetchStory(id: number): Promise<HNStory> {
  const cachedStory = await hackerNewsCache.getStory(id);
  if (cachedStory) {
    return cachedStory;
  }

  const story = await ky.get(`${HN_API_BASE}/item/${id}.json`).json<HNStory>();
  await hackerNewsCache.setStory(story);
  return story;
}

export async function fetchStories(
  page: number,
  limit: number,
  searchTerm?: string
): Promise<HNStory[]> {
  const allStories = await fetchTopStories();
  const start = page * limit;
  const end = start + limit;
  const pageIds = allStories.slice(start, end);

  const cachedStories = await hackerNewsCache.getMultipleStories(pageIds);
  const missingIds = pageIds.filter((id) => !cachedStories[id]);

  const newStories = await Promise.all(missingIds.map((id) => fetchStory(id)));

  const allPageStories = [...Object.values(cachedStories), ...newStories].sort(
    (a, b) => b.score - a.score
  );

  if (searchTerm) {
    const lowercaseSearch = searchTerm.toLowerCase();
    return allPageStories.filter(
      (story) =>
        story.title.toLowerCase().includes(lowercaseSearch) ||
        story.by.toLowerCase().includes(lowercaseSearch)
    );
  }

  return allPageStories;
}

export async function refreshHNCache(): Promise<void> {
  await hackerNewsCache.invalidateStories();
  const stories = await fetchTopStories();
  await Promise.all(stories.slice(0, 30).map((id) => fetchStory(id)));
}
