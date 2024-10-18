import { validateRequest } from "@zephyr/auth/auth";
import { type PostData, getPostDataInclude, prisma } from "@zephyr/db";

interface VoteInfo {
  aura: number;
  userVote: number;
}

export async function GET(
  _req: Request,
  { params: { postId } }: { params: { postId: string } }
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: getPostDataInclude(loggedInUser.id)
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const voteInfo: VoteInfo = {
      aura: post.aura,
      userVote: post.vote[0]?.value || 0
    };

    const postData: PostData & VoteInfo = {
      ...post,
      ...voteInfo
    };

    return Response.json(postData);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params: { postId } }: { params: { postId: string } }
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vote } = await req.json();

    if (vote !== 1 && vote !== -1) {
      return Response.json({ error: "Invalid vote value" }, { status: 400 });
    }

    const updatedPost = await prisma.$transaction(async (tx) => {
      const existingVote = await tx.vote.findUnique({
        where: {
          userId_postId: {
            userId: loggedInUser.id,
            postId
          }
        }
      });

      let voteChange = vote;

      if (existingVote) {
        if (existingVote.value === vote) {
          // Remove vote if it's the same
          await tx.vote.delete({
            where: {
              userId_postId: {
                userId: loggedInUser.id,
                postId
              }
            }
          });
          voteChange = -vote;
        } else {
          // Change vote
          await tx.vote.update({
            where: {
              userId_postId: {
                userId: loggedInUser.id,
                postId
              }
            },
            data: { value: vote }
          });
          voteChange = vote * 2; // -1 to 1 = +2, 1 to -1 = -2
        }
      } else {
        // New vote
        await tx.vote.create({
          data: {
            userId: loggedInUser.id,
            postId,
            value: vote
          }
        });
      }

      return tx.post.update({
        where: { id: postId },
        data: { aura: { increment: voteChange } },
        include: getPostDataInclude(loggedInUser.id)
      });
    });

    const voteInfo: VoteInfo = {
      aura: updatedPost.aura,
      userVote: updatedPost.vote.length > 0 ? updatedPost.vote[0].value : 0
    };

    const postData: PostData & VoteInfo = {
      ...updatedPost,
      ...voteInfo
    };

    return Response.json(postData);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params: { postId } }: { params: { postId: string } }
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedPost = await prisma.$transaction(async (tx) => {
      const vote = await tx.vote.findUnique({
        where: {
          userId_postId: {
            userId: loggedInUser.id,
            postId
          }
        }
      });

      if (vote) {
        await tx.post.update({
          where: { id: postId },
          data: { aura: { decrement: vote.value } }
        });

        await tx.vote.delete({
          where: {
            userId_postId: {
              userId: loggedInUser.id,
              postId
            }
          }
        });
      }

      return tx.post.findUnique({
        where: { id: postId },
        include: getPostDataInclude(loggedInUser.id)
      });
    });

    if (!updatedPost) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const voteInfo: VoteInfo = {
      aura: updatedPost.aura,
      userVote: 0
    };

    const postData: PostData & VoteInfo = {
      ...updatedPost,
      ...voteInfo
    };

    return Response.json(postData);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
