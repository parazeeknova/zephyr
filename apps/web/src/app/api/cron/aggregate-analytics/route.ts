import { prisma } from "@zephyr/db";
import { redis } from "@zephyr/db";
import type { NextRequest } from "next/server";

async function aggregateAnalytics() {
  const startTime = Date.now();
  console.log("Starting analytics aggregation");

  const results = {
    processedViews: 0,
    processedUsers: 0,
    updatedPosts: 0,
    updatedUserMetrics: 0,
    errors: [] as string[]
  };

  try {
    // 1. Aggregate post views
    console.log("Starting post views aggregation");
    const postViews = await redis.smembers("posts:with:views");
    const viewsData: { postId: string; views: number }[] = [];

    for (const postId of postViews) {
      try {
        const views = await redis.get(`post:views:${postId}`);
        if (views) {
          viewsData.push({
            postId,
            views: Number.parseInt(views, 10)
          });
        }
        results.processedViews++;
      } catch (error) {
        const errorMessage = `Error processing views for post ${postId}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        console.error(errorMessage);
        results.errors.push(errorMessage);
      }
    }

    // Update posts in batches
    const batchSize = 100;
    for (let i = 0; i < viewsData.length; i += batchSize) {
      const batch = viewsData.slice(i, i + batchSize);
      try {
        await Promise.all(
          batch.map((data) =>
            prisma.post.update({
              where: { id: data.postId },
              data: { viewCount: data.views }
            })
          )
        );
        results.updatedPosts += batch.length;
        console.log(`Updated ${batch.length} posts with view counts`);
      } catch (error) {
        const errorMessage = `Error updating post batch ${i / batchSize + 1}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        console.error(errorMessage);
        results.errors.push(errorMessage);
      }
    }

    // 2. Aggregate user metrics
    console.log("Starting user metrics aggregation");
    const userMetrics = await prisma.user.findMany({
      select: {
        id: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
            comments: true
          }
        }
      }
    });

    results.processedUsers = userMetrics.length;

    // Update Redis in batches
    for (let i = 0; i < userMetrics.length; i += batchSize) {
      const batch = userMetrics.slice(i, i + batchSize);
      const pipeline = redis.pipeline();

      for (const user of batch) {
        pipeline.hset(`user:metrics:${user.id}`, {
          posts: user._count.posts,
          followers: user._count.followers,
          following: user._count.following,
          comments: user._count.comments,
          lastUpdated: new Date().toISOString()
        });
        pipeline.expire(`user:metrics:${user.id}`, 86400); // 24 hours
      }

      try {
        await pipeline.exec();
        results.updatedUserMetrics += batch.length;
        console.log(`Updated metrics for ${batch.length} users`);
      } catch (error) {
        const errorMessage = `Error updating user metrics batch ${
          i / batchSize + 1
        }: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error(errorMessage);
        results.errors.push(errorMessage);
      }
    }

    const summary = {
      success: true,
      duration: Date.now() - startTime,
      ...results,
      timestamp: new Date().toISOString()
    };

    console.log("Analytics aggregation completed:", summary);
    return summary;
  } catch (error) {
    console.error("Analytics aggregation failed:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });

    return {
      success: false,
      duration: Date.now() - startTime,
      ...results,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    };
  }
}

export async function GET(req: NextRequest) {
  console.log("Received analytics aggregation request");

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
      console.warn("Unauthorized analytics aggregation attempt");
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

    const results = await aggregateAnalytics();

    return new Response(JSON.stringify(results), {
      status: results.success ? 200 : 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("Analytics route error:", {
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
