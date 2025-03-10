import { validateRequest } from '@zephyr/auth/auth';
import { type PostsPage, getPostDataInclude, prisma } from '@zephyr/db';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get('cursor') || undefined;
    const pageSize = 10;
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const standardInclude = getPostDataInclude(user.id);
    const enhancedInclude = {
      ...standardInclude,
      hnStoryShare: true,
    };

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: user.id,
      },
      include: {
        post: {
          include: enhancedInclude,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor =
      bookmarks.length > pageSize && bookmarks[pageSize]
        ? bookmarks[pageSize].id
        : null;

    const data: PostsPage = {
      posts: bookmarks.slice(0, pageSize).map((bookmark) => bookmark.post),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
