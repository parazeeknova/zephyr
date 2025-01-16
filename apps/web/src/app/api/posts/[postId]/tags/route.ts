import { validateRequest } from "@zephyr/auth/src";
import { prisma, tagCache } from "@zephyr/db";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const [{ user }, params] = await Promise.all([
      validateRequest(),
      context.params
    ]);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = params;
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { tags } = body;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: true,
        tags: true
      }
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.user.id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.post.update({
      where: { id: postId },
      data: {
        tags: {
          disconnect: post.tags.map((tag) => ({ id: tag.id }))
        }
      }
    });

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        tags: {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag.toLowerCase() },
            create: { name: tag.toLowerCase() }
          }))
        }
      },
      include: { tags: true }
    });

    await Promise.all([
      ...post.tags.map((tag) => tagCache.decrementTagCount(tag.name)),
      ...tags.map((tag: string) =>
        tagCache.incrementTagCount(tag.toLowerCase())
      )
    ]);

    return NextResponse.json({ tags: updatedPost.tags });
  } catch (error) {
    console.error("Error updating post tags:", error);
    return NextResponse.json(
      { error: "Failed to update tags" },
      { status: 500 }
    );
  }
}
