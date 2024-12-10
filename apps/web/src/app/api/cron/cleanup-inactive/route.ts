import { prisma } from "@zephyr/db";
import type { NextRequest } from "next/server";

async function cleanupInactiveUsers() {
  const startTime = Date.now();
  console.log("Starting inactive users cleanup job");

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const inactiveCount = await prisma.user.count({
      where: {
        AND: [{ emailVerified: false }, { createdAt: { lt: thirtyDaysAgo } }]
      }
    });

    console.log(`Found ${inactiveCount} potentially inactive users`);

    if (inactiveCount === 0) {
      return {
        success: true,
        deletedCount: 0,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }

    const batchSize = 100;
    let totalDeleted = 0;

    for (let offset = 0; offset < inactiveCount; offset += batchSize) {
      const batch = await prisma.user.findMany({
        where: {
          AND: [{ emailVerified: false }, { createdAt: { lt: thirtyDaysAgo } }]
        },
        select: { id: true },
        take: batchSize,
        skip: offset
      });

      if (batch.length > 0) {
        const deleteResult = await prisma.user.deleteMany({
          where: {
            id: { in: batch.map((user) => user.id) }
          }
        });

        totalDeleted += deleteResult.count;
        console.log(`Processed batch: deleted ${deleteResult.count} users`);
      }
    }

    const summary = {
      success: true,
      deletedCount: totalDeleted,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

    console.log("Cleanup completed:", summary);
    return summary;
  } catch (error) {
    console.error("Failed to cleanup inactive users:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });

    return {
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    };
  }
}

export async function GET(req: NextRequest) {
  console.log("Received cleanup inactive users request");

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

    const results = await cleanupInactiveUsers();

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
