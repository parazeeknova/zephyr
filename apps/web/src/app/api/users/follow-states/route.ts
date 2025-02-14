import { validateRequest } from '@zephyr/auth/src';
import { prisma } from '@zephyr/db';

export async function POST(req: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userIds } = await req.json();

    const follows = await prisma.follow.findMany({
      where: {
        followerId: loggedInUser.id,
        followingId: { in: userIds },
      },
    });

    const followers = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        _count: { select: { followers: true } },
      },
    });

    const followStates: Record<
      string,
      { followers: number; isFollowedByUser: boolean }
    > = {};

    // biome-ignore lint/complexity/noForEach: This is a simple loop
    followers.forEach((user) => {
      followStates[user.id] = {
        followers: user._count.followers,
        isFollowedByUser: follows.some((f) => f.followingId === user.id),
      };
    });

    return Response.json(followStates);
  } catch (_error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
