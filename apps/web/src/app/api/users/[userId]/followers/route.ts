import { validateRequest } from "@zephyr/auth/src";
import { debugLog } from "@zephyr/config/debug";
import { type FollowerInfo, followerInfoCache, prisma } from "@zephyr/db";
import { suggestedUsersCache } from "../../suggested/route";

export async function POST(
  _req: Request,
  props: { params: Promise<{ userId: string }> }
) {
  const params = await props.params;
  const { userId } = params;

  debugLog.api("Processing follow request:", userId);

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      debugLog.api("Unauthorized follow attempt");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const follow = await tx.follow.upsert({
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
      });

      const notification = await tx.notification.create({
        data: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: "FOLLOW"
        }
      });

      const userData = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          displayName: true,
          username: true,
          _count: { select: { followers: true } }
        }
      });

      return { follow, notification, userData };
    });

    debugLog.api("Follow transaction completed:", result);

    if (!result.userData) {
      return Response.json({ error: "User data not found" }, { status: 404 });
    }

    const followerInfo: FollowerInfo & {
      displayName: string;
      username: string;
    } = {
      followers: result.userData._count.followers,
      isFollowedByUser: true,
      displayName: result.userData.displayName,
      username: result.userData.username
    };

    await followerInfoCache.invalidate(params.userId);

    return Response.json(followerInfo);
  } catch (error) {
    debugLog.api("Follow request failed:", error);
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

    const [user, isFollowing] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          _count: {
            select: { followers: true }
          }
        }
      }),
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: loggedInUser.id,
            followingId: userId
          }
        }
      })
    ]);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: !!isFollowing
    };

    await followerInfoCache.set(userId, data);

    return Response.json(data);
  } catch (error) {
    console.error("GET follower info error:", error);
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

    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        displayName: true,
        username: true,
        _count: { select: { followers: true } }
      }
    });

    if (!userData) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const followerInfo: FollowerInfo & {
      displayName: string;
      username: string;
    } = {
      followers: userData._count.followers,
      isFollowedByUser: false,
      displayName: userData.displayName,
      username: userData.username
    };

    // Invalidate caches
    await Promise.all([
      followerInfoCache.invalidate(userId),
      suggestedUsersCache.invalidateForUser(userId)
    ]);

    return Response.json(followerInfo);
  } catch (error) {
    console.error("Unfollow error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
