import { validateRequest } from '@zephyr/auth/auth';
import { prisma } from '@zephyr/db';

export async function GET(request: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query) {
      return Response.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
      },
      take: 10,
    });

    return Response.json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
