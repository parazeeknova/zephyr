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

    try {
      await redis.ping();
      log("✅ Redis connection successful");
    } catch (error) {
      log("❌ Redis connection failed");
      console.error("Redis connection error:", error);
      return { success: false, logs, error: "Redis connection failed" };
    }

    const postsWithViews = await redis.smembers(POST_VIEWS_SET);
    log(`Found ${postsWithViews.length} posts with views in Redis`);

    if (postsWithViews.length === 0) {
      log("No posts found with views to sync");
      return { success: true, logs, syncedPosts: 0 };
    }

    const existingPosts = await prisma.post.findMany({
      where: {
        id: {
          in: postsWithViews
        }
      },
      select: {
        id: true
      }
    });

    const existingPostIds = new Set(existingPosts.map((post) => post.id));
    log(`Found ${existingPostIds.size} existing posts in database`);

    const pipeline = redis.pipeline();
    for (const postId of existingPostIds) {
      pipeline.get(`${POST_VIEWS_KEY_PREFIX}${postId}`);
    }

    const results = await pipeline.exec();
    if (!results) {
      log("Pipeline execution returned null");
      return { success: false, logs, error: "Pipeline execution failed" };
    }

    const updates = Array.from(existingPostIds)
      .map((postId, index) => {
        const [error, value] = results[index] || [];
        if (error) {
          log(`Error getting views for post ${postId}: ${error}`);
          return null;
        }
        return {
          postId,
          views: Number(value) || 0
        };
      })
      .filter(
        (update): update is { postId: string; views: number } =>
          update !== null && update.views > 0
      );

    log(`Preparing to update ${updates.length} posts with non-zero views`);

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
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        log(`Error updating batch ${batchNumber}: ${errorMessage}`);
        console.error(`Batch ${batchNumber} error:`, errorMessage);
      }
    }

    const nonExistentPosts = postsWithViews.filter(
      (id) => !existingPostIds.has(id)
    );
    if (nonExistentPosts.length > 0) {
      log(
        `Found ${nonExistentPosts.length} non-existent posts in Redis, cleaning up...`
      );
      const cleanupPipeline = redis.pipeline();
      for (const postId of nonExistentPosts) {
        cleanupPipeline.del(`${POST_VIEWS_KEY_PREFIX}${postId}`);
        cleanupPipeline.srem(POST_VIEWS_SET, postId);
      }
      await cleanupPipeline.exec();
      log(
        `Cleaned up Redis entries for ${nonExistentPosts.length} non-existent posts`
      );
    }

    const summary = {
      success: true,
      logs,
      syncedPosts: totalUpdated,
      totalFound: postsWithViews.length,
      cleanedUp: nonExistentPosts.length,
      timestamp: new Date().toISOString()
    };

    log(
      `\nSync completed: ${totalUpdated} posts updated, ${nonExistentPosts.length} cleaned up`
    );
    return summary;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    log(`Error in view count sync: ${errorMessage}`);
    console.error("Sync error:", errorMessage);
    return { success: false, logs, error: errorMessage };
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
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
