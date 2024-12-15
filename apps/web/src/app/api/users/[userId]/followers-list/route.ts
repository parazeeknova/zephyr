import { validateRequest } from "@zephyr/auth/src";
import { prisma } from "@zephyr/db";

export async function GET(
  _req: Request,
  props: { params: { userId: string } }
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const followers = await prisma.user.findMany({
      where: {
        following: {
          some: {
            followingId: props.params.userId
          }
        }
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        _count: {
          select: {
            followers: true
          }
        }
      }
    });

    const followingStatus = await prisma.follow.findMany({
      where: {
        followerId: loggedInUser.id,
        followingId: {
          in: followers.map((user) => user.id)
        }
      }
    });

    const followingSet = new Set(followingStatus.map((f) => f.followingId));

    const followersWithStatus = followers.map((user) => ({
      ...user,
      isFollowing: followingSet.has(user.id)
    }));

    return Response.json(followersWithStatus);
  } catch (error) {
    console.error("Error fetching followers list:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
