import { hackerNewsAPI } from '@zephyr/aggregator/hackernews';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '0');
    const limit = Number.parseInt(searchParams.get('limit') || '30');
    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') || 'score';
    const type = searchParams.get('type') || 'all';

    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';

    const result = await hackerNewsAPI.fetchStories({
      page,
      limit,
      search,
      sort,
      type,
      identifier: ip,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching HN stories:', error);

    if ((error as any).statusCode === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: (error as any).statusCode || 500 }
    );
  }
}

export async function POST() {
  try {
    await hackerNewsAPI.refreshCache();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error refreshing HN cache:', error);

    if ((error as any).statusCode === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to refresh cache' },
      { status: (error as any).statusCode || 500 }
    );
  }
}

export const runtime = 'nodejs';
