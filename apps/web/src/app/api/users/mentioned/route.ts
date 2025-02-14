import { validateRequest } from '@zephyr/auth/auth';
import { prisma } from '@zephyr/db';

export async function GET() {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        _count: {
          select: {
            mentions: true,
          },
        },
      },
      where: {
        mentions: {
          some: {}, // Only include users who have been mentioned at least once
        },
      },
      orderBy: {
        mentions: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    return Response.json({ users });
  } catch (error) {
    console.error('Error fetching mentioned users:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
