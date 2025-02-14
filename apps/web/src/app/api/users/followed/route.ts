import { validateRequest } from '@zephyr/auth/auth';
import { getUserDataSelect, prisma } from '@zephyr/db';

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const followedUsers = await prisma.user.findMany({
      where: {
        followers: {
          some: {
            followerId: user.id,
          },
        },
      },
      select: getUserDataSelect(user.id),
    });

    return Response.json(followedUsers);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
