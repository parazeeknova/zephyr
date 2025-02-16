import { validateRequest } from '@zephyr/auth/auth';
import { getPostDataInclude, prisma, searchSuggestionsCache } from '@zephyr/db';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type');
    const cursor = searchParams.get('cursor');

    if (type === 'suggestions') {
      const suggestions = await searchSuggestionsCache.getSuggestions(q);
      return Response.json(suggestions);
    }

    if (type === 'history') {
      const history = await searchSuggestionsCache.getHistory(user.id);
      return Response.json(history);
    }

    const searchQuery = q.split(' ').join(' & ');
    const pageSize = 10;

    if (q) {
      await Promise.all([
        searchSuggestionsCache.addToHistory(user.id, q),
        searchSuggestionsCache.addSuggestion(q),
      ]);
    }

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { content: { search: searchQuery } },
          { user: { displayName: { search: searchQuery } } },
          { user: { username: { search: searchQuery } } },
        ],
      },
      include: getPostDataInclude(user.id),
      orderBy: { createdAt: 'desc' },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor =
      posts.length > pageSize && posts[pageSize] ? posts[pageSize].id : null;

    return Response.json({
      posts: posts.slice(0, pageSize),
      nextCursor,
    });
  } catch (error) {
    console.error('Error in search API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await req.json();
    if (!query) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    await Promise.all([
      searchSuggestionsCache.addToHistory(user.id, query),
      searchSuggestionsCache.addSuggestion(query),
    ]);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in search API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type');
    const query = searchParams.get('query');

    if (type !== 'history') {
      return Response.json({ error: 'Invalid operation' }, { status: 400 });
    }

    if (query) {
      await searchSuggestionsCache.removeHistoryItem(user.id, query);
    } else {
      await searchSuggestionsCache.clearHistory(user.id);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in search API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
