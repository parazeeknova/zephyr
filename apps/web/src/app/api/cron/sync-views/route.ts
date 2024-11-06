import {
  POST_VIEWS_KEY_PREFIX,
  POST_VIEWS_SET,
  prisma,
  redis
} from "@zephyr/db";
import { NextResponse } from "next/server";

const CRON_SECRET = process.env.CRON_SECRET;

async function syncViewCounts() {
  const logs: string[] = [];
  const log = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  try {
    log("Starting view count sync...");

    // Test Redis connection
    try {
      await redis.ping();
      log("✅ Redis connection successful");
    } catch (error) {
      log("❌ Redis connection failed");
      console.error("Redis connection error:", error);
      return { success: false, logs, error: "Redis connection failed" };
    }

    // Get all posts that have views
    const postsWithViews = await redis.smembers(POST_VIEWS_SET);
    log(`Found ${postsWithViews.length} posts with views in Redis`);

    if (postsWithViews.length === 0) {
      log("No posts found with views to sync");
      return { success: true, logs, syncedPosts: 0 };
    }

    // Get view counts for all posts
    const pipeline = redis.pipeline();
    for (const postId of postsWithViews) {
      pipeline.get(`${POST_VIEWS_KEY_PREFIX}${postId}`);
    }

    const results = await pipeline.exec();
    log(`Retrieved ${results.length} view counts from Redis`);

    // Create updates array
    const updates = postsWithViews
      .map((postId, index) => ({
        postId,
        views: Number(results[index]) || 0
      }))
      .filter((update) => update.views > 0);

    log(`Preparing to update ${updates.length} posts with non-zero views`);

    // Update database in batches
    const batchSize = 100;
    let totalUpdated = 0;

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(updates.length / batchSize);

      try {
        await prisma.$transaction(
          batch.map(({ postId, views }) =>
            prisma.post.update({
              where: { id: postId },
              data: { viewCount: views }
            })
          )
        );

        totalUpdated += batch.length;
        log(
          `Updated batch ${batchNumber} of ${totalBatches} (${batch.length} posts)`
        );
      } catch (error) {
        log(`Error updating batch ${batchNumber}: ${error}`);
        console.error(`Batch ${batchNumber} error:`, error);
      }
    }

    // Verify a sample of updates
    const sampleSize = Math.min(5, updates.length);
    const sampleUpdates = updates.slice(0, sampleSize);

    log("\nVerifying sample of updates:");
    for (const { postId, views } of sampleUpdates) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { id: true, viewCount: true }
      });
      log(`Post ${postId}: Expected=${views}, Actual=${post?.viewCount}`);
    }

    const summary = {
      success: true,
      logs,
      syncedPosts: totalUpdated,
      totalFound: postsWithViews.length,
      timestamp: new Date().toISOString()
    };

    log(`\nSync completed: ${totalUpdated} posts updated`);
    return summary;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    log(`Error in view count sync: ${errorMessage}`);
    console.error("Sync error:", error);
    return { success: false, logs, error: errorMessage };
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    // Verify the request is authorized
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await syncViewCounts();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
