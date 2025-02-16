import { validateRequest } from '@zephyr/auth/auth';
import { type PostData, getPostDataInclude, prisma } from '@zephyr/db';

interface VoteInfo {
  aura: number;
  userVote: number;
}

export async function GET(
  _req: Request,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;
  const { postId } = params;

  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: getPostDataInclude(loggedInUser.id),
    });

    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    const voteInfo: VoteInfo = {
      aura: post.aura,
      userVote: post.vote[0]?.value || 0,
    };

    const postData: PostData & VoteInfo = {
      ...post,
      ...voteInfo,
    };

    return Response.json(postData);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;
  const { postId } = params;

  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vote } = await req.json();

    if (vote !== 1 && vote !== -1) {
      return Response.json({ error: 'Invalid vote value' }, { status: 400 });
    }

    const updatedPost = await prisma.$transaction(async (tx) => {
      const post = await tx.post.findUnique({
        where: { id: postId },
        select: {
          id: true,
          userId: true,
          user: {
            select: {
              id: true,
              aura: true,
            },
          },
        },
      });

      if (!post) {
        throw new Error('Post not found');
      }

      const existingVote = await tx.vote.findUnique({
        where: {
          userId_postId: {
            userId: loggedInUser.id,
            postId,
          },
        },
      });

      let voteChange = vote;
      let shouldNotify = false;
      let auraChange = vote;

      if (existingVote) {
        if (existingVote.value === vote) {
          await tx.vote.delete({
            where: {
              userId_postId: {
                userId: loggedInUser.id,
                postId,
              },
            },
          });
          voteChange = -vote;
          auraChange = -vote;

          await tx.user.update({
            where: { id: post.userId },
            data: { aura: { decrement: Math.abs(auraChange) } },
          });
        } else {
          await tx.vote.update({
            where: {
              userId_postId: {
                userId: loggedInUser.id,
                postId,
              },
            },
            data: { value: vote },
          });
          voteChange = vote * 2;
          auraChange = vote * 2;
          shouldNotify = vote === 1;

          await tx.user.update({
            where: { id: post.userId },
            data: { aura: { increment: vote * 2 } },
          });
        }
      } else {
        await tx.vote.create({
          data: {
            userId: loggedInUser.id,
            postId,
            value: vote,
          },
        });
        shouldNotify = vote === 1;

        await tx.user.update({
          where: { id: post.userId },
          data: { aura: { increment: vote } },
        });
      }

      const updatedPost = await tx.post.update({
        where: { id: postId },
        data: { aura: { increment: voteChange } },
        include: {
          ...getPostDataInclude(loggedInUser.id),
          user: true,
        },
      });

      if (shouldNotify && updatedPost.userId !== loggedInUser.id) {
        await tx.notification.create({
          data: {
            recipientId: updatedPost.userId,
            issuerId: loggedInUser.id,
            postId,
            type: 'AMPLIFY',
          },
        });
      }

      await tx.auraLog.create({
        data: {
          userId: post.userId,
          amount: auraChange,
          type: 'POST_VOTE',
          postId: post.id,
          issuerId: loggedInUser.id,
        },
      });

      return updatedPost;
    });

    const voteInfo: VoteInfo = {
      aura: updatedPost.aura,
      userVote:
        updatedPost.vote?.length > 0 ? (updatedPost.vote[0]?.value ?? 0) : 0,
    };

    // @ts-expect-error
    const postData: PostData & VoteInfo = {
      ...updatedPost,
      ...voteInfo,
    };

    return Response.json(postData);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;
  const { postId } = params;

  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedPost = await prisma.$transaction(async (tx) => {
      const existingVote = await tx.vote.findUnique({
        where: {
          userId_postId: {
            userId: loggedInUser.id,
            postId,
          },
        },
        select: { value: true },
      });

      if (!existingVote) {
        return null;
      }

      const post = await tx.post.findUnique({
        where: { id: postId },
        select: { userId: true },
      });

      if (!post) {
        throw new Error('Post not found');
      }

      await tx.vote.delete({
        where: {
          userId_postId: {
            userId: loggedInUser.id,
            postId,
          },
        },
      });

      await tx.user.update({
        where: { id: post.userId },
        data: { aura: { decrement: existingVote.value } },
      });

      if (existingVote.value === 1) {
        await tx.notification.deleteMany({
          where: {
            issuerId: loggedInUser.id,
            postId,
            type: 'AMPLIFY',
          },
        });
      }

      await tx.auraLog.create({
        data: {
          userId: post.userId,
          amount: -existingVote.value,
          type: 'POST_VOTE_REMOVED',
          postId,
          issuerId: loggedInUser.id,
        },
      });

      return tx.post.update({
        where: { id: postId },
        data: { aura: { decrement: existingVote.value } },
        include: getPostDataInclude(loggedInUser.id),
      });
    });

    if (!updatedPost) {
      return Response.json({ error: 'Vote not found' }, { status: 404 });
    }

    const voteInfo: VoteInfo = {
      aura: updatedPost.aura,
      userVote: 0,
    };

    const postData: PostData & VoteInfo = {
      ...updatedPost,
      ...voteInfo,
    };

    return Response.json(postData);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
