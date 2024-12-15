import { hackerNewsAPI } from "@zephyr/aggregator/hackernews";
import { validateRequest } from "@zephyr/auth/auth";
import { prisma } from "@zephyr/db";

export async function GET(request: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = 20;

    const bookmarks = await prisma.hNBookmark.findMany({
      where: { userId: loggedInUser.id },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" }
    });

    const hasMore = bookmarks.length > limit;
    if (hasMore) bookmarks.pop();

    const stories = await Promise.all(
      bookmarks.map((bookmark) => hackerNewsAPI.fetchStory(bookmark.storyId))
    );

    return Response.json({
      stories: stories.filter(Boolean),
      nextCursor:
        hasMore && bookmarks[bookmarks.length - 1]
          ? bookmarks[bookmarks.length - 1]?.id
          : null
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
