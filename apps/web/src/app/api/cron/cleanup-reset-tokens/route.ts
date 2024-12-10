import { prisma } from "@zephyr/db";
import { NextResponse } from "next/server";

async function cleanupResetTokens() {
  const logs: string[] = [];
  const startTime = Date.now();

  const log = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  try {
    log("🚀 Starting password reset tokens cleanup");

    const expiredCount = await prisma.passwordResetToken.count({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    log(`🔍 Found ${expiredCount} expired reset tokens`);

    const totalTokens = await prisma.passwordResetToken.count();
    log(`📊 Current total tokens: ${totalTokens}`);

    if (expiredCount === 0) {
      log("✨ No expired tokens to clean up");
      return {
        success: true,
        deletedCount: 0,
        duration: Date.now() - startTime,
        stats: {
          totalTokens,
          expiredTokens: 0,
          deletionPercentage: "0.00"
        },
        logs,
        timestamp: new Date().toISOString()
      };
    }

    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    const remainingTokens = await prisma.passwordResetToken.count();
    const deletionPercentage = ((result.count / totalTokens) * 100).toFixed(2);

    const summary = {
      success: true,
      deletedCount: result.count,
      duration: Date.now() - startTime,
      stats: {
        totalBefore: totalTokens,
        totalAfter: remainingTokens,
        expiredTokens: expiredCount,
        deletionPercentage
      },
      logs,
      timestamp: new Date().toISOString()
    };

    log(`✨ Reset tokens cleanup completed successfully:
    Duration: ${summary.duration}ms
    Total Before: ${totalTokens}
    Deleted: ${result.count}
    Remaining: ${remainingTokens}
    Cleaned: ${deletionPercentage}%`);

    return summary;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    log(`❌ Reset tokens cleanup failed: ${errorMessage}`);
    console.error(
      "Cleanup error stack:",
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

export async function POST(request: Request) {
  console.log("📥 Received reset tokens cleanup request");

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
      console.warn("⚠️ Unauthorized reset tokens cleanup attempt");
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

    const results = await cleanupResetTokens();

    return NextResponse.json(results, {
      status: results.success ? 200 : 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("❌ Reset tokens cleanup route error:", {
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
