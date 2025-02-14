import { NotificationType } from '@prisma/client';
import { validateRequest } from '@zephyr/auth/auth';
import { prisma } from '@zephyr/db';

export async function GET(
  // biome-ignore lint/correctness/noUnusedVariables: ignore
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mentions = await prisma.mention.findMany({
      where: {
        postId: params.postId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return Response.json({ mentions: mentions.map((m) => m.user) });
  } catch (error) {
    console.error('Error fetching mentions:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mentions } = await request.json();

    const post = await prisma.post.findUnique({
      where: { id: params.postId },
      select: { userId: true },
    });

    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.userId !== user.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Start a transaction to handle mentions and notifications
    await prisma.$transaction(async (tx) => {
      // Remove existing mentions
      await tx.mention.deleteMany({
        where: { postId: params.postId },
      });

      // Create new mentions
      const mentionPromises = mentions.map((userId: string) =>
        tx.mention.create({
          data: {
            postId: params.postId,
            userId,
          },
        })
      );

      // Create notifications for newly mentioned users
      const notificationPromises = mentions.map((userId: string) =>
        tx.notification.create({
          data: {
            type: NotificationType.MENTION,
            recipientId: userId,
            issuerId: user.id,
            postId: params.postId,
          },
        })
      );

      await Promise.all([...mentionPromises, ...notificationPromises]);
    });

    const updatedMentions = await prisma.mention.findMany({
      where: {
        postId: params.postId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return Response.json({ mentions: updatedMentions.map((m) => m.user) });
  } catch (error) {
    console.error('Error updating mentions:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
