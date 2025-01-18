import { validateRequest } from "@zephyr/auth/auth";
import { getCommentDataInclude, prisma } from "@zephyr/db";
import type { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;
  const { postId } = params;

  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content?.trim()) {
      return Response.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    const comment = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          content,
          userId: user.id,
          postId
        },
        include: getCommentDataInclude(user.id)
      });

      const post = await tx.post.findUnique({
        where: { id: postId },
        select: { userId: true }
      });

      if (!post) throw new Error("Post not found");

      await tx.user.update({
        where: { id: user.id },
        data: { aura: { increment: 1 } }
      });

      await tx.auraLog.create({
        data: {
          userId: user.id,
          issuerId: user.id,
          amount: 1,
          type: "COMMENT_CREATION",
          postId,
          commentId: newComment.id
        }
      });

      await tx.user.update({
        where: { id: post.userId },
        data: { aura: { increment: 5 } }
      });

      await tx.auraLog.create({
        data: {
          userId: post.userId,
          issuerId: user.id,
          amount: 5,
          type: "COMMENT_RECEIVED",
          postId,
          commentId: newComment.id
        }
      });

      return newComment;
    });

    return Response.json(comment);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;
  const { postId } = params;
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");

  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const take = 10;
    const comments = await prisma.comment.findMany({
      where: { postId },
      take,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
      include: getCommentDataInclude(user.id)
    });

    const nextCursor =
      comments.length === take && comments[take - 1]
        ? comments[take - 1].id
        : null;

    return Response.json({
      comments,
      previousCursor: nextCursor
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
