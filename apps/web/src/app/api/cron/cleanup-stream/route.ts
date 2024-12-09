import { getStreamConfig } from "@zephyr/config/src/env";
import { prisma } from "@zephyr/db";
import type { NextRequest } from "next/server";
import { StreamChat } from "stream-chat";

async function cleanupStreamUsers() {
  const { apiKey, secret } = getStreamConfig();
  if (!apiKey || !secret) {
    throw new Error(
      "Stream Chat environment variables are required for this script. " +
        "Please set NEXT_PUBLIC_STREAM_CHAT_API_KEY and STREAM_CHAT_SECRET"
    );
  }

  const streamClient = StreamChat.getInstance(apiKey, secret);
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

    console.log({
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
            console.log(`Deleted StreamChat user: ${user.id}`);
          } catch (error) {
            errorCount++;
            console.error(
              `Failed to delete StreamChat user ${user.id}:`,
              error
            );
          }
        })
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return {
      success: true,
      duration: Date.now() - startTime,
      totalProcessed: usersToDelete.length,
      deletedCount,
      errorCount,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Stream cleanup error:", error);
    return {
      success: false,
      duration: Date.now() - startTime,
      deletedCount,
      errorCount,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    };
  } finally {
    streamClient.disconnectUser();
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET_KEY}`;

    if (!authHeader || authHeader !== expectedAuth) {
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

    const results = await cleanupStreamUsers();

    return new Response(JSON.stringify(results), {
      status: results.success ? 200 : 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("API route error:", error);

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
