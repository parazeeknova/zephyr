import { validateRequest } from "@zephyr/auth/src";
import {
  type FollowerInfo,
  followerInfoCache,
  prisma,
  redis
} from "@zephyr/db";
import { suggestedUsersCache } from "../../suggested/route";

export async function POST(
  _req: Request,
  props: { params: Promise<{ userId: string }> }
) {
  const params = await props.params;
  const { userId } = params;

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction([
      prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: loggedInUser.id,
            followingId: userId
          }
        },
        create: {
          followerId: loggedInUser.id,
          followingId: userId
        },
        update: {}
      }),
      prisma.notification.create({
        data: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: "FOLLOW"
        }
      })
    ]);

    await Promise.all([
      followerInfoCache.invalidate(userId),
      suggestedUsersCache.invalidateForUser(userId),
      redis.del(`user:${userId}`)
    ]);

    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        _count: { select: { followers: true } }
      }
    });

    return Response.json(userData);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  _req: Request,
  props: { params: Promise<{ userId: string }> }
) {
  const params = await props.params;
  const { userId } = params;

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cachedData = await followerInfoCache.get(userId);
    if (cachedData) {
      return Response.json(cachedData);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          where: {
            followerId: loggedInUser.id
          },
          select: {
            followerId: true
          }
        },
        _count: {
          select: {
            followers: true
          }
        }
      }
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.length
    };

    await followerInfoCache.set(userId, data);

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ userId: string }> }
) {
  const params = await props.params;
  const { userId } = params;

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: {
          followerId: loggedInUser.id,
          followingId: userId
        }
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: "FOLLOW"
        }
      })
    ]);

    await Promise.all([
      followerInfoCache.invalidate(userId),
      suggestedUsersCache.invalidateForUser(userId),
      redis.del(`user:${userId}`)
    ]);

    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        _count: { select: { followers: true } }
      }
    });

    await followerInfoCache.invalidate(userId);

    return Response.json(userData);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
