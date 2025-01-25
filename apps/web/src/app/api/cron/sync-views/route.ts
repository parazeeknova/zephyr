import {
  POST_VIEWS_KEY_PREFIX,
  POST_VIEWS_SET,
  prisma,
  redis
} from "@zephyr/db";
import { NextResponse } from "next/server";

async function syncViewCounts() {
  const logs: string[] = [];
  const startTime = Date.now();

  const log = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  const results = {
    syncedPosts: 0,
    skippedPosts: 0,
    deletedKeys: 0,
    errors: [] as string[]
  };

  try {
    log("🚀 Starting view count sync");

    // 1. Test Redis connection
    try {
      await redis.ping();
      log("✅ Redis connection successful");
    } catch (error) {
      log("❌ Redis connection failed");
      console.error("Redis connection error:", error);
      return {
        success: false,
        duration: Date.now() - startTime,
        logs,
        error: "Redis connection failed"
      };
    }

    // 2. Get posts with views and create view count map
    const postsWithViews = await redis.smembers(POST_VIEWS_SET);
    if (postsWithViews.length === 0) {
      log("✨ No posts found with views to sync");
      return {
        success: true,
        duration: Date.now() - startTime,
        logs,
        ...results
      };
    }

    log(`📊 Found ${postsWithViews.length} posts with views in Redis`);

    // 3. Get existing posts and their current view counts
    const existingPosts = await prisma.post.findMany({
      where: {
        id: { in: postsWithViews }
      },
      select: {
        id: true,
        viewCount: true
      }
    });

    const existingPostMap = new Map(
      existingPosts.map((p) => [p.id, p.viewCount])
    );
    log(`📊 Found ${existingPostMap.size} existing posts in database`);

    // 4. Get Redis view counts in batches
    const batchSize = 100;
    const updates: { postId: string; views: number }[] = [];

    for (let i = 0; i < postsWithViews.length; i += batchSize) {
      const batch = postsWithViews.slice(i, i + batchSize);
      const pipeline = redis.pipeline();

      // biome-ignore lint/complexity/noForEach: This is a batch operation
      batch.forEach((postId) => {
        pipeline.get(`${POST_VIEWS_KEY_PREFIX}${postId}`);
      });

      const batchResults = await pipeline.exec();
      if (!batchResults) continue;

      batch.forEach((postId, index) => {
        const [error, value] = batchResults[index] || [];
        if (error) {
          results.errors.push(
            `Error getting views for post ${postId}: ${error}`
          );
          return;
        }

        const redisViews = Number(value) || 0;
        const dbViews = existingPostMap.get(postId) || 0;

        // Update if Redis views are different from DB views
        if (redisViews !== dbViews) {
          updates.push({ postId, views: redisViews });
          log(`Post ${postId}: Redis views ${redisViews}, DB views ${dbViews}`);
        } else {
          results.skippedPosts++;
          log(`Post ${postId}: Skipped (Redis: ${redisViews}, DB: ${dbViews})`);
        }
      });
    }

    log(`🔄 Found ${updates.length} posts needing updates`);

    // 5. Update posts in batches
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

        results.syncedPosts += batch.length;
        log(
          `✅ Batch ${batchNumber}/${totalBatches}: Updated ${batch.length} posts`
        );

        if (i + batchSize < updates.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        const errorMessage = `Error updating batch ${batchNumber}: ${
          error instanceof Error ? error.message : String(error)
        }`;
        log(`❌ ${errorMessage}`);
        results.errors.push(errorMessage);
      }
    }

    // 6. Clean up non-existent posts
    const nonExistentPosts = postsWithViews.filter(
      (id) => !existingPostMap.has(id)
    );
    if (nonExistentPosts.length > 0) {
      log(`🧹 Found ${nonExistentPosts.length} non-existent posts to clean up`);

      for (let i = 0; i < nonExistentPosts.length; i += batchSize) {
        const batch = nonExistentPosts.slice(i, i + batchSize);
        const pipeline = redis.pipeline();

        // biome-ignore lint/complexity/noForEach: This is a batch operation
        batch.forEach((postId) => {
          pipeline.del(`${POST_VIEWS_KEY_PREFIX}${postId}`);
          pipeline.srem(POST_VIEWS_SET, postId);
        });

        await pipeline.exec();
        results.deletedKeys += batch.length * 2;
      }

      log(`✅ Cleaned up ${nonExistentPosts.length} non-existent posts`);
    }

    const summary = {
      success: true,
      duration: Date.now() - startTime,
      ...results,
      logs,
      stats: {
        totalPosts: postsWithViews.length,
        existingPosts: existingPostMap.size,
        updatedPosts: results.syncedPosts,
        skippedPosts: results.skippedPosts,
        cleanedUpPosts: nonExistentPosts.length
      },
      timestamp: new Date().toISOString()
    };

    log(`\n✨ Sync completed successfully:
    Duration: ${summary.duration}ms
    Total Posts: ${summary.stats.totalPosts}
    Updated: ${summary.stats.updatedPosts}
    Skipped: ${summary.stats.skippedPosts}
    Cleaned: ${summary.stats.cleanedUpPosts}
    Errors: ${results.errors.length}`);

    return summary;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    log(`❌ Fatal error in view count sync: ${errorMessage}`);
    console.error(
      "Sync error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    return {
      success: false,
      duration: Date.now() - startTime,
      ...results,
      error: errorMessage,
      logs,
      timestamp: new Date().toISOString()
    };
  } finally {
    try {
      await prisma.$disconnect();
      log("👋 Database connection closed");
    } catch (_error) {
      log("❌ Error closing database connection");
    }
  }
}

export async function POST(request: Request) {
  console.log("📥 Received view count sync request");

  try {
    if (!process.env.CRON_SECRET_KEY) {
      console.error("❌ CRON_SECRET_KEY environment variable not set");
      return NextResponse.json(
        {
          error: "Server configuration error",
          timestamp: new Date().toISOString()
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
          }
        }
      );
    }

    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET_KEY}`;

    if (!authHeader || authHeader !== expectedAuth) {
      console.warn("⚠️ Unauthorized sync attempt");
      return NextResponse.json(
        {
          error: "Unauthorized",
          timestamp: new Date().toISOString()
        },
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
          }
        }
      );
    }

    const results = await syncViewCounts();

    return NextResponse.json(results, {
      status: results.success ? 200 : 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("❌ Sync route error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
