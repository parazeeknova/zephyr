import { hackerNewsAPI } from '@zephyr/aggregator/hackernews';
import { checkRateLimit } from '@zephyr/aggregator/hackernews/rate-limiter';
import { validateRequest } from '@zephyr/auth/auth';
import { prisma } from '@zephyr/db';

export async function GET(request: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canProceed = await checkRateLimit(`bookmarks:${loggedInUser.id}`);
    if (!canProceed) {
      return Response.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = 20;

    const bookmarks = await prisma.hNBookmark.findMany({
      where: { userId: loggedInUser.id },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = bookmarks.length > limit;
    if (hasMore) bookmarks.pop();

    const stories = await Promise.all(
      bookmarks.map((bookmark) => hackerNewsAPI.fetchStory(bookmark.storyId))
    );

    return new Response(
      JSON.stringify({
        stories: stories.filter(Boolean),
        nextCursor:
          hasMore && bookmarks.length > 0
            ? bookmarks[bookmarks.length - 1]?.id
            : null,
      }),
      {
        headers: {
          'Cache-Control': 'public, max-age=30',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching bookmarked stories:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
