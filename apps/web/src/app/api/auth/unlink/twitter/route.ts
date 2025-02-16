import { validateRequest } from '@zephyr/auth/auth';
import { prisma } from '@zephyr/db';

export async function POST() {
  try {
    const { user: sessionUser } = await validateRequest();
    if (!sessionUser) {
      return Response.json(
        { error: 'Unauthorized' },
        {
          status: 401,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        twitterId: true,
      },
    });

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        {
          status: 404,
        }
      );
    }

    if (!user.email?.includes('@twitter.placeholder.com')) {
      return Response.json(
        { error: 'Cannot unlink: No email associated with account' },
        {
          status: 400,
        }
      );
    }

    const hasPassword = !!user.passwordHash;
    if (!hasPassword) {
      return Response.json(
        { error: 'Cannot unlink: Need at least one authentication method' },
        {
          status: 400,
        }
      );
    }

    if (!user.twitterId) {
      return Response.json(
        { error: 'Twitter account is not linked' },
        {
          status: 400,
        }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twitterId: null },
    });

    return Response.json({
      success: true,
      message: 'Twitter account unlinked successfully',
    });
  } catch (error) {
    console.error('Error unlinking Twitter account:', error);
    return Response.json(
      { error: 'An error occurred while unlinking the account' },
      {
        status: 500,
      }
    );
  }
}
