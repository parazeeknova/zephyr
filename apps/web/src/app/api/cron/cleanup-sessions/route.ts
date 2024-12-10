import { prisma } from "@zephyr/db";
import type { NextRequest } from "next/server";

async function cleanupExpiredSessions() {
  const startTime = Date.now();
  console.log("Starting expired sessions cleanup");

  try {
    // First get count of expired sessions
    const expiredCount = await prisma.session.count({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    console.log(`Found ${expiredCount} expired sessions`);

    if (expiredCount === 0) {
      return {
        success: true,
        deletedCount: 0,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }

    // Delete expired sessions
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    const summary = {
      success: true,
      deletedCount: result.count,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

    console.log("Sessions cleanup completed:", summary);
    return summary;
  } catch (error) {
    console.error("Failed to cleanup expired sessions:", {
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
  console.log("Received cleanup expired sessions request");

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

    const results = await cleanupExpiredSessions();

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
