import { prisma } from '@zephyr/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const postsWithTags = await prisma.post.findMany({
      select: {
        id: true,
        content: true,
        tags: {
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                posts: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ posts: postsWithTags });
  } catch (error) {
    console.error('Error fetching posts with tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
