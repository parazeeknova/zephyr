import { Prisma } from '@prisma/client';
import { validateRequest } from '@zephyr/auth/auth';
import { getUserDataSelect, prisma, redis } from '@zephyr/db';
import type { UserData } from '@zephyr/db';

const SUGGESTED_USERS_CACHE_KEY = (userId: string) =>
  `suggested-users:${userId}`;
const CACHE_TTL = 300; // 5 minutes

const RECENTLY_SHOWN_CACHE_KEY = (userId: string) =>
  `recently-shown-users:${userId}`;
const RECENTLY_SHOWN_TTL = 3600; // 1 hour

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const cacheKey = SUGGESTED_USERS_CACHE_KEY(user.id);
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return Response.json(JSON.parse(cachedData));
    }

    const recentlyShownKey = RECENTLY_SHOWN_CACHE_KEY(user.id);
    const recentlyShown = (await redis.smembers(recentlyShownKey)) || [];

    const suggestedUsers = await prisma.user.findMany({
      take: 15,
      orderBy:
        Math.random() > 0.3
          ? { aura: Prisma.SortOrder.desc }
          : {
              followers: {
                _count: Prisma.SortOrder.desc,
              },
            },
      where: {
        AND: [
          { id: { not: user.id } },
          { id: { notIn: recentlyShown } },
          {
            followers: {
              none: {
                followerId: user.id,
              },
            },
          },
        ],
      },
      select: {
        ...getUserDataSelect(user.id),
        aura: true,
        followers: {
          where: {
            follower: {
              followers: {
                some: {
                  followerId: user.id,
                },
              },
            },
          },
          select: {
            follower: {
              select: {
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    const selectedUsers = suggestedUsers
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    await Promise.all(
      selectedUsers.map((user) => redis.sadd(recentlyShownKey, user.id))
    );
    await redis.expire(recentlyShownKey, RECENTLY_SHOWN_TTL);

    const transformedUsers = selectedUsers.map((user) => ({
      ...user,
      mutualFollowers: user.followers.map((f) => f.follower),
    }));

    await redis.set(
      cacheKey,
      JSON.stringify(transformedUsers),
      'EX',
      CACHE_TTL
    );

    return Response.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching suggested users:', error);
    return Response.json(
      { error: 'Failed to fetch suggested users' },
      { status: 500 }
    );
  }
}

export const suggestedUsersCache = {
  async get(userId: string) {
    try {
      const cached = await redis.get(SUGGESTED_USERS_CACHE_KEY(userId));
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting suggested users from cache:', error);
      return null;
    }
  },

  async set(userId: string, data: unknown) {
    try {
      await redis.set(
        SUGGESTED_USERS_CACHE_KEY(userId),
        JSON.stringify(data),
        'EX',
        CACHE_TTL
      );
    } catch (error) {
      console.error('Error setting suggested users cache:', error);
    }
  },

  async invalidate(userId: string) {
    try {
      await redis.del(SUGGESTED_USERS_CACHE_KEY(userId));
    } catch (error) {
      console.error('Error invalidating suggested users cache:', error);
    }
  },

  async invalidateAll() {
    try {
      const keys = await redis.keys('suggested-users:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Error invalidating all suggested users caches:', error);
    }
  },

  async invalidateForUser(userId: string) {
    try {
      await Promise.all([
        redis.del(SUGGESTED_USERS_CACHE_KEY(userId)),
        redis.del(`follower-info:${userId}`),
      ]);
    } catch (error) {
      console.error('Error invalidating user caches:', error);
    }
  },
};

export type { UserData };
