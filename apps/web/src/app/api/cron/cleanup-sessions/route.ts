import { prisma } from "@zephyr/db";
import type { NextRequest } from "next/server";

async function cleanupExpiredSessions() {
  const now = new Date();

  try {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    });

    return {
      success: true,
      deletedCount: result.count,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Failed to cleanup expired sessions:", error);
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

    const results = await cleanupExpiredSessions();
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
