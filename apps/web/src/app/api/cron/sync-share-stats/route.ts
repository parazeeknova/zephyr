import { prisma, redis } from "@zephyr/db";
import { shareStatsCache } from "@zephyr/db";
import { NextResponse } from "next/server";

const SHARE_STATS_PREFIX = "share:stats:";
const SHARE_CLICKS_PREFIX = "share:clicks:";

type Platform =
  | "twitter"
  | "facebook"
  | "linkedin"
  | "instagram"
  | "pinterest"
  | "reddit"
  | "whatsapp"
  | "discord"
  | "email"
  | "copy"
  | "qr";

const SUPPORTED_PLATFORMS: Platform[] = [
  "twitter",
  "facebook",
  "linkedin",
  "instagram",
  "pinterest",
  "reddit",
  "whatsapp",
  "discord",
  "email",
  "copy",
  "qr"
];

async function syncShareStats() {
  const logs: string[] = [];
  const startTime = Date.now();

  const log = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  const results = {
    syncedCount: 0,
    errorCount: 0,
    totalProcessed: 0,
    errors: [] as string[],
    deletedKeys: 0
  };

  try {
    log("🚀 Starting share statistics sync process");

    // Get all posts that need stats synced
    const posts = await prisma.post.findMany({
      select: { id: true },
      where: {
        createdAt: {
          // Only sync posts from the last 30 days
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    log(`📊 Found ${posts.length} posts to process`);

    const batchSize = 25;
    let processed = 0;

    // Process each post
    for (const post of posts) {
      try {
        // Process each platform for the post
        for (const platform of SUPPORTED_PLATFORMS) {
          const stats = await shareStatsCache.getStats(post.id, platform);

          if (stats.shares > 0 || stats.clicks > 0) {
            // Only upsert if there are actual stats
            await prisma.shareStats.upsert({
              where: {
                postId_platform: {
                  postId: post.id,
                  platform
                }
              },
              update: {
                shares: stats.shares,
                clicks: stats.clicks,
                updatedAt: new Date()
              },
              create: {
                postId: post.id,
                platform,
                shares: stats.shares,
                clicks: stats.clicks
              }
            });

            results.syncedCount++;
            log(`✅ Synced stats for post ${post.id} on ${platform}`);

            // Cleanup Redis keys after successful sync
            const shareKey = `${SHARE_STATS_PREFIX}${post.id}:${platform}`;
            const clickKey = `${SHARE_CLICKS_PREFIX}${post.id}:${platform}`;
            await Promise.all([redis.del(shareKey), redis.del(clickKey)]);
            results.deletedKeys += 2;
          }
        }
      } catch (error) {
        const errorMessage = `Failed to sync stats for post ${post.id}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        log(`❌ ${errorMessage}`);
        results.errors.push(errorMessage);
        results.errorCount++;
      }

      processed++;
      results.totalProcessed = processed;

      if (processed % batchSize === 0) {
        log(`📊 Progress: ${processed}/${posts.length} posts processed`);
        // Rate limiting to prevent overloading
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // Cleanup old keys that might be orphaned
    const [oldShareKeys, oldClickKeys] = await Promise.all([
      redis.keys(`${SHARE_STATS_PREFIX}*`),
      redis.keys(`${SHARE_CLICKS_PREFIX}*`)
    ]);

    const oldKeys = [...oldShareKeys, ...oldClickKeys];
    if (oldKeys.length > 0) {
      await redis.del(...oldKeys);
      results.deletedKeys += oldKeys.length;
      log(`🧹 Cleaned up ${oldKeys.length} orphaned Redis keys`);
    }

    const successSummary = {
      success: true,
      duration: Date.now() - startTime,
      ...results,
      logs,
      timestamp: new Date().toISOString()
    };

    log(`✨ Share stats sync completed successfully
    Duration: ${successSummary.duration}ms
    Total Posts Processed: ${successSummary.totalProcessed}
    Stats Synced: ${successSummary.syncedCount}
    Keys Deleted: ${successSummary.deletedKeys}
    Errors: ${successSummary.errorCount}`);

    return successSummary;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    log(`❌ Fatal error during share stats sync: ${errorMessage}`);
    console.error(
      "Share stats sync error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    return {
      success: false,
      duration: Date.now() - startTime,
      ...results,
      logs,
      error: errorMessage,
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

export async function GET(request: Request) {
  console.log("📥 Received share stats sync request");

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
      console.warn("⚠️ Unauthorized share stats sync attempt");
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

    const results = await syncShareStats();

    return NextResponse.json(results, {
      status: results.success ? 200 : 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("❌ Share stats sync route error:", {
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
