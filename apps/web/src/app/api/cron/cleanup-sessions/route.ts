import { prisma } from "@zephyr/db";
import { NextResponse } from "next/server";

async function cleanupExpiredSessions() {
  const logs: string[] = [];
  const startTime = Date.now();

  const log = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  try {
    log("🚀 Starting expired sessions cleanup");
    const expiredCount = await prisma.session.count({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    log(`🔍 Found ${expiredCount} expired sessions`);

    if (expiredCount === 0) {
      log("✨ No expired sessions to clean up");
      return {
        success: true,
        deletedCount: 0,
        duration: Date.now() - startTime,
        logs,
        timestamp: new Date().toISOString()
      };
    }
    const totalSessions = await prisma.session.count();
    log(`📊 Current total sessions: ${totalSessions}`);

    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    const remainingSessions = await prisma.session.count();

    const summary = {
      success: true,
      deletedCount: result.count,
      duration: Date.now() - startTime,
      stats: {
        beforeCleanup: totalSessions,
        afterCleanup: remainingSessions,
        deletionPercentage: ((result.count / totalSessions) * 100).toFixed(2)
      },
      logs,
      timestamp: new Date().toISOString()
    };

    log(`✨ Sessions cleanup completed successfully:
    - Deleted: ${result.count} sessions
    - Duration: ${summary.duration}ms
    - Before: ${totalSessions}
    - After: ${remainingSessions}
    - Cleaned: ${summary.stats.deletionPercentage}%`);

    return summary;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    log(`❌ Failed to cleanup expired sessions: ${errorMessage}`);
    console.error(
      "Sessions cleanup error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    return {
      success: false,
      duration: Date.now() - startTime,
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

export async function GET(request: Request) {
  console.log("📥 Received cleanup expired sessions request");

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
      console.warn("⚠️ Unauthorized cleanup attempt");
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

    const results = await cleanupExpiredSessions();

    return NextResponse.json(results, {
      status: results.success ? 200 : 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("❌ Sessions cleanup route error:", {
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
