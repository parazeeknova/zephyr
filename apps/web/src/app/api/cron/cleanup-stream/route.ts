import { getStreamClient } from "@zephyr/auth/src/stream/services";
import { prisma } from "@zephyr/db";
import type { NextRequest } from "next/server";

export const runtime = "edge";
export const preferredRegion = "iad1";

async function cleanupStreamUsers() {
  const streamClient = getStreamClient();
  if (!streamClient) {
    throw new Error("Failed to initialize Stream client");
  }

  const batchSize = 25;
  let deletedCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  try {
    const { users } = await streamClient.queryUsers(
      {},
      { last_active: -1 },
      { limit: 100 }
    );

    const dbUsers = await prisma.user.findMany({
      select: { id: true }
    });

    const dbUserIds = new Set(dbUsers.map((user) => user.id));
    const usersToDelete = users.filter((user) => !dbUserIds.has(user.id));

    const logger = {
      info: (...args: any[]) => console.log(new Date().toISOString(), ...args),
      error: (...args: any[]) =>
        console.error(new Date().toISOString(), ...args)
    };

    logger.info({
      message: "Starting cleanup",
      totalStreamUsers: users.length,
      totalDbUsers: dbUserIds.size,
      usersToDelete: usersToDelete.length
    });

    for (let i = 0; i < usersToDelete.length; i += batchSize) {
      const batch = usersToDelete.slice(i, i + batchSize);

      await Promise.allSettled(
        batch.map(async (user) => {
          try {
            await streamClient.deleteUser(user.id, {
              mark_messages_deleted: true,
              hard_delete: true
            });
            deletedCount++;
            logger.info({
              message: "Deleted user",
              userId: user.id
            });
          } catch (error) {
            errorCount++;
            logger.error({
              message: "Failed to delete user",
              userId: user.id,
              error: error instanceof Error ? error.message : String(error)
            });
          }
        })
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const summary = {
      duration: Date.now() - startTime,
      totalProcessed: usersToDelete.length,
      successfullyDeleted: deletedCount,
      errors: errorCount
    };

    logger.info({
      message: "Cleanup completed",
      ...summary
    });

    return summary;
  } catch (error) {
    console.error("Fatal error during cleanup:", error);
    throw error;
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

    const results = await cleanupStreamUsers();

    return new Response(
      JSON.stringify({
        success: true,
        ...results
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("API route error:", error);

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
