import { shareStatsCache } from '@zephyr/db';
import { type NextRequest, NextResponse } from 'next/server';

type Params = { params: { postId: string } };

export async function POST(request: NextRequest, params: Params) {
  const { postId } = await params.params;

  if (!postId) {
    return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { platform } = body;

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      );
    }

    const clicks = await shareStatsCache.incrementClick(postId, platform);
    return NextResponse.json({ clicks });
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}
