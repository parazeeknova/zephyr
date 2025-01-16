import { validateRequest } from "@zephyr/auth/auth";
import type { BookmarkInfo } from "@zephyr/db";
import { prisma } from "@zephyr/db";

export async function GET(
  _req: Request,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;

  const { postId } = params;

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: loggedInUser.id,
          postId
        }
      }
    });

    const data: BookmarkInfo = {
      isBookmarkedByUser: !!bookmark
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  _req: Request,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;
  const { postId } = params;

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.bookmark.upsert({
        where: {
          userId_postId: {
            userId: loggedInUser.id,
            postId
          }
        },
        create: {
          userId: loggedInUser.id,
          postId
        },
        update: {}
      });

      const post = await tx.post.findUnique({
        where: { id: postId },
        select: { userId: true }
      });

      if (!post) throw new Error("Post not found");

      await tx.user.update({
        where: { id: loggedInUser.id },
        data: { aura: { increment: 2 } }
      });

      await tx.auraLog.create({
        data: {
          userId: loggedInUser.id,
          issuerId: loggedInUser.id,
          amount: 2,
          type: "POST_BOOKMARKED",
          postId
        }
      });

      await tx.user.update({
        where: { id: post.userId },
        data: { aura: { increment: 10 } }
      });

      await tx.auraLog.create({
        data: {
          userId: post.userId,
          issuerId: loggedInUser.id,
          amount: 10,
          type: "POST_BOOKMARK_RECEIVED",
          postId
        }
      });
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
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
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.bookmark.deleteMany({
        where: {
          userId: loggedInUser.id,
          postId
        }
      });

      const post = await tx.post.findUnique({
        where: { id: postId },
        select: { userId: true }
      });

      if (!post) throw new Error("Post not found");

      await tx.user.update({
        where: { id: loggedInUser.id },
        data: { aura: { decrement: 2 } }
      });

      await tx.user.update({
        where: { id: post.userId },
        data: { aura: { decrement: 10 } }
      });
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
