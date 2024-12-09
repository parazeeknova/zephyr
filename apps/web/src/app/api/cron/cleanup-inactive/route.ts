import { prisma } from "@zephyr/db";
import type { NextRequest } from "next/server";

async function cleanupInactiveUsers() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const inactiveUsers = await prisma.user.findMany({
      where: {
        AND: [{ emailVerified: false }, { createdAt: { lt: thirtyDaysAgo } }]
      },
      select: { id: true }
    });

    if (inactiveUsers.length > 0) {
      await prisma.user.deleteMany({
        where: {
          id: { in: inactiveUsers.map((user) => user.id) }
        }
      });
    }

    return {
      success: true,
      deletedCount: inactiveUsers.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Failed to cleanup inactive users:", error);
    return {
      success: false,
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

    const results = await cleanupInactiveUsers();
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
