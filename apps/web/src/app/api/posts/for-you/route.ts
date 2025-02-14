import type { Prisma } from '@prisma/client';
import { validateRequest } from '@zephyr/auth/auth';
import { type PostsPage, getPostDataInclude, prisma } from '@zephyr/db';
import { tagCache } from '@zephyr/db';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get('cursor');
    const tags = req.nextUrl.searchParams
      .get('tags')
      ?.split(',')
      .filter((tag: string) => Boolean(tag));

    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pageSize = 8;

    const query: Prisma.PostFindManyArgs = {
      include: {
        ...getPostDataInclude(user.id),
        tags: {
          include: {
            _count: {
              select: {
                posts: true,
              },
            },
          },
        },
        mentions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      where: tags?.length
        ? {
            tags: {
              some: {
                name: {
                  in: tags,
                },
              },
            },
          }
        : undefined,
    };

    const posts = await prisma.post.findMany(query);

    if (!posts) {
      return NextResponse.json({
        posts: [],
        nextCursor: null as string | null,
      } satisfies PostsPage);
    }

    if (posts.length > 0) {
      const allTags = posts.flatMap(
        (post) =>
          // @ts-expect-error
          post.tags?.map((tag) => ({
            name: tag.name,
            count: tag._count?.posts,
          })) ?? []
      );

      await Promise.all(
        [...new Set(allTags.map((t) => t.name))].map((tagName: string) =>
          tagCache.incrementTagCount(tagName)
        )
      );
    }

    const nextCursor: string | null =
      posts.length > pageSize ? (posts[pageSize]?.id ?? null) : null;

    const responseData: PostsPage = {
      // @ts-expect-error
      posts: posts.slice(0, pageSize).map((post) => ({
        ...post,
        // @ts-expect-error
        tags: post.tags.map((tag) => ({
          ...tag,
          _count: tag._count || { posts: 0 },
        })),
        // @ts-expect-error
        mentions: post.mentions || [],
      })),
      nextCursor,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
