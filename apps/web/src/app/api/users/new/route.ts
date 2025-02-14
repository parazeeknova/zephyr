import { validateRequest } from '@zephyr/auth/auth';
import { getUserDataSelect, prisma } from '@zephyr/db';

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const newUsers = await prisma.user.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        id: {
          not: user.id,
        },
      },
      select: getUserDataSelect(user.id),
    });

    return Response.json(newUsers);
  } catch (_error) {
    return Response.json(
      { error: 'Failed to fetch new users' },
      { status: 500 }
    );
  }
}
