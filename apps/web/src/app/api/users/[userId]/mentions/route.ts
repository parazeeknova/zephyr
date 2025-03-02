import { validateRequest } from '@zephyr/auth/auth';
import { prisma } from '@zephyr/db';

export async function GET(
  _request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mentions = await prisma.mention.findMany({
      where: {
        userId: params.userId,
      },
      include: {
        post: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                aura: true,
                followers: {
                  where: { followerId: user.id },
                  select: {
                    followerId: true,
                    followingId: true,
                  },
                },
                _count: {
                  select: {
                    followers: true,
                    following: true,
                  },
                },
              },
            },
            attachments: true,
            bookmarks: {
              where: {
                userId: user.id,
              },
            },
            vote: {
              where: {
                userId: user.id,
              },
            },
            _count: {
              select: {
                comments: true,
              },
            },
            tags: true,
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
            hnStoryShare: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const posts = mentions.map((mention) => {
      const { post } = mention;
      const createdAt =
        typeof post.createdAt === 'string'
          ? post.createdAt
          : // biome-ignore lint/nursery/noNestedTernary: This is a nested ternary that is not nested too deeply
            post.createdAt instanceof Date
            ? post.createdAt.toISOString()
            : new Date().toISOString();

      const enhancedUser = {
        ...post.user,
        isFollowing: post.user.followers?.length > 0,
        followerCount: post.user._count?.followers ?? 0,
        followingCount: post.user._count?.following ?? 0,
      };

      return {
        ...post,
        createdAt,
        user: enhancedUser,
        commentCount: post._count.comments,
        isOwner: post.user.id === user.id,
        isBookmarked: post.bookmarks.length > 0,
        isVoted: post.vote.length > 0,
        voteValue: post.vote[0]?.value || 0,
      };
    });

    return Response.json(posts);
  } catch (error) {
    console.error('Error fetching mentioned posts:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
