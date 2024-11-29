import ky from "@/lib/ky";

const HN_API_BASE = "https://hacker-news.firebaseio.com/v0";

export async function fetchHackerNewsStories(
  page: number,
  limit: number,
  searchTerm?: string
) {
  // Get top stories IDs
  const topStoriesIds = await ky
    .get(`${HN_API_BASE}/topstories.json`)
    .json<number[]>();

  // Calculate pagination
  const start = page * limit;
  const end = start + limit;
  const pageIds = topStoriesIds.slice(start, end);

  // Fetch individual stories
  const stories = await Promise.all(
    pageIds.map((id) => ky.get(`${HN_API_BASE}/item/${id}.json`).json())
  );

  // Filter by search term if provided
  if (searchTerm) {
    const lowercaseSearch = searchTerm.toLowerCase();
    return stories.filter(
      (story) =>
        // @ts-expect-error
        story.title.toLowerCase().includes(lowercaseSearch) ||
        // @ts-expect-error
        story.by
          .toLowerCase()
          .includes(lowercaseSearch)
    );
  }

  return stories;
}
