import { prisma } from '@zephyr/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      where: {
        posts: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        posts: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    return NextResponse.json({ tags: [] }, { status: 500 });
  }
}
