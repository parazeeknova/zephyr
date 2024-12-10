import { prisma } from "@zephyr/db";
import { NextResponse } from "next/server";

async function cleanupUnverifiedUsers() {
  const logs: string[] = [];
  const startTime = Date.now();

  const log = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  try {
    log("🚀 Starting unverified users cleanup");

    const totalUsers = await prisma.user.count();
    log(`📊 Current total users: ${totalUsers}`);

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const unverifiedCount = await prisma.user.count({
      where: {
        emailVerified: false,
        googleId: null,
        createdAt: {
          lt: oneHourAgo
        }
      }
    });

    log(`🔍 Found ${unverifiedCount} unverified users older than 1 hour`);

    if (unverifiedCount === 0) {
      log("✨ No unverified users to clean up");
      return {
        success: true,
        tokensDeleted: 0,
        usersDeleted: 0,
        duration: Date.now() - startTime,
        stats: {
          totalUsers,
          unverifiedUsers: 0,
          deletionPercentage: "0.00"
        },
        logs,
        timestamp: new Date().toISOString()
      };
    }

    const usersToDelete = await prisma.user.findMany({
      where: {
        emailVerified: false,
        googleId: null,
        createdAt: {
          lt: oneHourAgo
        }
      },
      select: {
        id: true,
        username: true,
        createdAt: true
      }
    });

    // biome-ignore lint/complexity/noForEach: No need to refactor
    usersToDelete.forEach((user) => {
      const age = Math.round(
        (Date.now() - user.createdAt.getTime()) / (1000 * 60)
      );
      log(`📝 Will delete: ${user.username} (Age: ${age} minutes)`);
    });

    const [tokenDeletion, userDeletion] = await prisma.$transaction([
      prisma.emailVerificationToken.deleteMany({
        where: {
          user: {
            emailVerified: false,
            googleId: null,
            createdAt: {
              lt: oneHourAgo
            }
          }
        }
      }),
      prisma.user.deleteMany({
        where: {
          emailVerified: false,
          googleId: null,
          createdAt: {
            lt: oneHourAgo
          }
        }
      })
    ]);

    const remainingUsers = await prisma.user.count();
    const deletionPercentage = (
      (userDeletion.count / totalUsers) *
      100
    ).toFixed(2);

    const summary = {
      success: true,
      tokensDeleted: tokenDeletion.count,
      usersDeleted: userDeletion.count,
      duration: Date.now() - startTime,
      stats: {
        totalUsersBefore: totalUsers,
        totalUsersAfter: remainingUsers,
        unverifiedUsers: unverifiedCount,
        deletionPercentage
      },
      logs,
      timestamp: new Date().toISOString()
    };

    log(`✨ Unverified users cleanup completed successfully:
    Duration: ${summary.duration}ms
    Tokens Deleted: ${tokenDeletion.count}
    Users Deleted: ${userDeletion.count}
    Total Before: ${totalUsers}
    Total After: ${remainingUsers}
    Cleaned: ${deletionPercentage}%`);

    return summary;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    log(`❌ Unverified users cleanup failed: ${errorMessage}`);
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
  console.log("📥 Received unverified users cleanup request");

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
      console.warn("⚠️ Unauthorized unverified users cleanup attempt");
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

    const results = await cleanupUnverifiedUsers();

    return NextResponse.json(results, {
      status: results.success ? 200 : 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("❌ Unverified users cleanup route error:", {
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
