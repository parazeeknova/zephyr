import { prisma } from "@zephyr/db";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Delete expired reset tokens
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    return Response.json({
      success: true,
      deletedCount: result.count
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const allowedMethods = ["POST"];
