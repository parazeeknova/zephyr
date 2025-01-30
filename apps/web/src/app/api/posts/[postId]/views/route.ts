import { debugLog } from "@zephyr/config/debug";
import { postViewsCache } from "@zephyr/db";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;
    debugLog.views(`Received view increment request for post: ${postId}`);

    if (!postId) {
      debugLog.views("Missing postId in request");
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const newCount = await postViewsCache.incrementView(postId);
    debugLog.views(`Incremented view count for post: ${postId} to ${newCount}`);

    return NextResponse.json({
      success: true,
      viewCount: newCount
    });
  } catch (error) {
    debugLog.views("Error incrementing view count:", error);
    return NextResponse.json(
      { error: "Failed to increment view count" },
      { status: 500 }
    );
  }
}
