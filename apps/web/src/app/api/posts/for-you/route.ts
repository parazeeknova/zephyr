import type { NextRequest } from "next/server";

import { validateRequest } from "@zephyr/auth/auth";
import { type PostsPage, getPostDataInclude, prisma } from "@zephyr/db";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const { user } = await validateRequest();

    const pageSize = 8;

    if (!user) {
      return Response.json(
        {
          error: "Unauthorized"
        },
        { status: 401 }
      );
    }

    const posts = await prisma.post.findMany({
      include: getPostDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined
    });

    const nextCursor =
      posts.length > pageSize && posts[pageSize] ? posts[pageSize].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        error: "Internal server error"
      },
      { status: 500 }
    );
  }
}
