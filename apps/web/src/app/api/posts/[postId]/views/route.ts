import { postViewsCache } from "@zephyr/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: { postId: string } }
) {
  try {
    const { postId } = await Promise.resolve(context.params);

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const newCount = await postViewsCache.incrementView(postId);

    return NextResponse.json({
      success: true,
      viewCount: newCount
    });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return NextResponse.json(
      { error: "Failed to increment view count" },
      { status: 500 }
    );
  }
}
