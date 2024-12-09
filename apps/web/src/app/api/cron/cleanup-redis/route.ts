import { prisma } from "@zephyr/db";
import {
  POST_VIEWS_KEY_PREFIX,
  POST_VIEWS_SET,
  type TrendingTopic,
  redis,
  trendingTopicsCache
} from "@zephyr/db";
import type { NextRequest } from "next/server";

export const runtime = "edge";
export const preferredRegion = "iad1";

async function cleanupRedisCache() {
  const startTime = Date.now();
  const results = {
    deletedPostViews: 0,
    cleanedTrendingTopics: 0,
    errors: [] as string[]
  };

  try {
    // 1. Clean up post views for deleted posts
    const postIdsWithViews = await redis.smembers(POST_VIEWS_SET);
    console.log(`Found ${postIdsWithViews.length} posts with views to check`);

    const batchSize = 100;
    for (let i = 0; i < postIdsWithViews.length; i += batchSize) {
      const batch = postIdsWithViews.slice(i, i + batchSize);
      const existingPosts = await prisma.post.findMany({
        where: {
          id: {
            in: batch
          }
        },
        select: {
          id: true
        }
      });

      const existingPostIds = new Set(existingPosts.map((p) => p.id));
      const pipeline = redis.pipeline();

      for (const postId of batch) {
        if (!existingPostIds.has(postId)) {
          pipeline.srem(POST_VIEWS_SET, postId);
          pipeline.del(`${POST_VIEWS_KEY_PREFIX}${postId}`);
          results.deletedPostViews++;
        }
      }

      await pipeline.exec();
      console.log(
        `Processed batch ${i / batchSize + 1}, deleted ${results.deletedPostViews} post views so far`
      );
    }

    // 2. Clean up trending topics
    const currentTrendingTopics = await trendingTopicsCache.get();
    console.log(
      `Found ${currentTrendingTopics.length} trending topics to check`
    );

    if (currentTrendingTopics.length > 0) {
      const validTopics: TrendingTopic[] = [];

      for (const topic of currentTrendingTopics) {
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
      }

      if (results.cleanedTrendingTopics > 0) {
        await trendingTopicsCache.set(validTopics);
        console.log(
          `Updated trending topics cache, removed ${results.cleanedTrendingTopics} topics`
        );
      }
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
    console.error("Redis cleanup error:", error);
    results.errors.push(errorMessage);

    const errorSummary = {
      success: false,
      duration: Date.now() - startTime,
      ...results,
      error: errorMessage,
      timestamp: new Date().toISOString()
    };

    console.error("Cache cleanup failed:", errorSummary);
    return errorSummary;
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET_KEY}`;

    if (!authHeader || authHeader !== expectedAuth) {
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
    console.error("API route error:", error);

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
