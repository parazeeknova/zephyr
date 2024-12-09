import { prisma } from "@zephyr/db";
import { redis } from "@zephyr/db";
import type { NextRequest } from "next/server";

async function aggregateAnalytics() {
  const startTime = Date.now();
  try {
    const postViews = await redis.smembers("posts:with:views");
    const viewsData = [];

    for (const postId of postViews) {
      const views = await redis.get(`post:views:${postId}`);
      if (views) {
        viewsData.push({
          postId,
          views: Number.parseInt(views, 10)
        });
      }
    }

    for (const data of viewsData) {
      await prisma.post.update({
        where: { id: data.postId },
        data: { viewCount: data.views }
      });
    }

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

    const pipeline = redis.pipeline();
    for (const user of userMetrics) {
      pipeline.hset(`user:metrics:${user.id}`, {
        posts: user._count.posts,
        followers: user._count.followers,
        following: user._count.following,
        comments: user._count.comments,
        lastUpdated: new Date().toISOString()
      });
      pipeline.expire(`user:metrics:${user.id}`, 86400);
    }
    await pipeline.exec();

    return {
      success: true,
      duration: Date.now() - startTime,
      processedViews: viewsData.length,
      processedUsers: userMetrics.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Analytics aggregation failed:", error);
    return {
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    };
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET_KEY}`;

    if (!authHeader || authHeader !== expectedAuth) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const results = await aggregateAnalytics();
    return new Response(JSON.stringify(results), {
      status: results.success ? 200 : 500,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
