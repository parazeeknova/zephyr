import { prisma } from "@zephyr/db";
import { redis } from "@zephyr/db";
import type { NextRequest } from "next/server";

async function cleanupRedisCache() {
  const startTime = Date.now();
  console.log("Starting Redis cache cleanup");

  const results = {
    deletedPostViews: 0,
    cleanedTrendingTopics: 0,
    processedKeys: 0,
    errors: [] as string[]
  };

  try {
    // 1. Clean up post views with error handling for each operation
    const postIdsWithViews = await redis.smembers("posts:with:views");
    console.log(`Found ${postIdsWithViews.length} posts with views to check`);

    const batchSize = 100;
    for (let i = 0; i < postIdsWithViews.length; i += batchSize) {
      try {
        const batch = postIdsWithViews.slice(i, i + batchSize);
        results.processedKeys += batch.length;

        const existingPosts = await prisma.post.findMany({
          where: { id: { in: batch } },
          select: { id: true }
        });

        const existingPostIds = new Set(existingPosts.map((p) => p.id));
        const pipeline = redis.pipeline();
        let batchDeletions = 0;

        for (const postId of batch) {
          if (!existingPostIds.has(postId)) {
            pipeline.srem("posts:with:views", postId);
            pipeline.del(`post:views:${postId}`);
            batchDeletions++;
          }
        }

        await pipeline.exec();
        results.deletedPostViews += batchDeletions;

        console.log(
          `Processed batch ${i / batchSize + 1}/${Math.ceil(
            postIdsWithViews.length / batchSize
          )}, deleted ${batchDeletions} views`
        );
      } catch (error) {
        const errorMessage = `Error processing batch ${i / batchSize + 1}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        console.error(errorMessage);
        results.errors.push(errorMessage);
      }
    }

    // 2. Clean up trending topics with backup handling
    try {
      const [currentTrendingTopics, backupTopics] = await Promise.all([
        redis.get("trending:topics"),
        redis.get("trending:topics:backup")
      ]);

      let topics = [];
      if (currentTrendingTopics) {
        topics = JSON.parse(currentTrendingTopics);
      } else if (backupTopics) {
        topics = JSON.parse(backupTopics);
        console.log("Using backup topics due to missing current topics");
      }

      if (topics.length > 0) {
        const validTopics = [];
        for (const topic of topics) {
          try {
            const postsWithHashtag = await prisma.post.count({
              where: {
                content: {
                  contains: topic.hashtag,
                  mode: "insensitive"
                }
              }
            });

            if (postsWithHashtag > 0) {
              validTopics.push({
                hashtag: topic.hashtag,
                count: postsWithHashtag
              });
            } else {
              results.cleanedTrendingTopics++;
            }
          } catch (error) {
            console.error(`Error processing topic ${topic.hashtag}:`, error);
            results.errors.push(
              `Failed to process topic ${topic.hashtag}: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
          }
        }

        if (results.cleanedTrendingTopics > 0) {
          const pipeline = redis.pipeline();
          pipeline.set(
            "trending:topics",
            JSON.stringify(validTopics),
            "EX",
            3600
          );
          pipeline.set(
            "trending:topics:backup",
            JSON.stringify(validTopics),
            "EX",
            86400
          );
          await pipeline.exec();
        }
      }
    } catch (error) {
      const errorMessage = `Error processing trending topics: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
      console.error(errorMessage);
      results.errors.push(errorMessage);
    }

    const summary = {
      success: true,
      duration: Date.now() - startTime,
      ...results,
      timestamp: new Date().toISOString()
    };

    console.log("Cache cleanup completed:", summary);
    return summary;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Redis cleanup error:", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });

    return {
      success: false,
      duration: Date.now() - startTime,
      ...results,
      error: errorMessage,
      timestamp: new Date().toISOString()
    };
  }
}

export async function GET(req: NextRequest) {
  console.log("Received Redis cleanup request");

  try {
    const authHeader = req.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET_KEY}`;

    if (!process.env.CRON_SECRET_KEY) {
      console.error("CRON_SECRET_KEY environment variable not set");
      return new Response(
        JSON.stringify({
          error: "Server configuration error",
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
          }
        }
      );
    }

    if (!authHeader || authHeader !== expectedAuth) {
      console.warn("Unauthorized cleanup attempt");
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          timestamp: new Date().toISOString()
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
          }
        }
      );
    }

    const results = await cleanupRedisCache();

    return new Response(JSON.stringify(results), {
      status: results.success ? 200 : 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("Cleanup route error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      }),
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
