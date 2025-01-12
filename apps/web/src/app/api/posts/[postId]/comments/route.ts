import { validateRequest } from "@zephyr/auth/auth";
import { type CommentsPage, getCommentDataInclude, prisma } from "@zephyr/db";
import type { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;

  const { postId } = params;

  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 5;

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: getCommentDataInclude(user.id),
      orderBy: { createdAt: "asc" },
      take: -pageSize - 1,
      cursor: cursor ? { id: cursor } : undefined
    });

    const previousCursor =
      comments.length > pageSize ? (comments[0]?.id ?? null) : null;

    const data: CommentsPage = {
      comments: comments.length > pageSize ? comments.slice(1) : comments,
      previousCursor
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
