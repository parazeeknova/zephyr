import { validateRequest } from "@zephyr/auth/auth";
import { getUserDataSelect, prisma } from "@zephyr/db";

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get users that the current user is not following
    const suggestedUsers = await prisma.user.findMany({
      take: 6,
      where: {
        AND: [
          {
            id: {
              not: user.id
            }
          },
          {
            followers: {
              none: {
                followerId: user.id
              }
            }
          }
        ]
      },
      select: {
        ...getUserDataSelect(user.id),
        followers: {
          where: {
            follower: {
              followers: {
                some: {
                  followerId: user.id
                }
              }
            }
          },
          select: {
            follower: {
              select: {
                username: true,
                displayName: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    // Transform the data to include mutual followers in a cleaner format
    const transformedUsers = suggestedUsers.map((user) => ({
      ...user,
      mutualFollowers: user.followers.map((f) => f.follower)
    }));

    return Response.json(transformedUsers);
  } catch (_error) {
    return Response.json(
      { error: "Failed to fetch suggested users" },
      { status: 500 }
    );
  }
}
