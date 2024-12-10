import { getStreamConfig } from "@zephyr/config/src/env";
import { prisma } from "@zephyr/db";
import type { NextRequest } from "next/server";
import { StreamChat } from "stream-chat";

async function cleanupStreamUsers() {
  const startTime = Date.now();
  console.log("Starting Stream users cleanup");

  const { apiKey, secret } = getStreamConfig();
  if (!apiKey || !secret) {
    throw new Error(
      "Stream Chat configuration missing. Required: NEXT_PUBLIC_STREAM_CHAT_API_KEY and STREAM_CHAT_SECRET"
    );
  }

  const streamClient = StreamChat.getInstance(apiKey, secret);
  const batchSize = 25;
  let deletedCount = 0;
  let errorCount = 0;
  let totalProcessed = 0;
  const errors: string[] = [];

  try {
    console.log("Fetching Stream users...");
    const { users } = await streamClient.queryUsers(
      {},
      { last_active: -1 },
      { limit: 1000 }
    );

    console.log("Fetching database users...");
    const dbUsers = await prisma.user.findMany({
      select: { id: true }
    });

    const dbUserIds = new Set(dbUsers.map((user) => user.id));
    const usersToDelete = users.filter((user) => !dbUserIds.has(user.id));

    const summary = {
      totalStreamUsers: users.length,
      totalDbUsers: dbUserIds.size,
      usersToDelete: usersToDelete.length
    };

    console.log("Initial analysis:", summary);

    if (usersToDelete.length === 0) {
      return {
        success: true,
        duration: Date.now() - startTime,
        totalProcessed: 0,
        deletedCount: 0,
        errorCount: 0,
        timestamp: new Date().toISOString()
      };
    }

    // Process in batches
    for (let i = 0; i < usersToDelete.length; i += batchSize) {
      const batch = usersToDelete.slice(i, i + batchSize);
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(usersToDelete.length / batchSize)}`
      );

      const results = await Promise.allSettled(
        batch.map(async (user) => {
          try {
            await streamClient.deleteUser(user.id, {
              mark_messages_deleted: true,
              hard_delete: true
            });
            console.log(`Successfully deleted Stream user: ${user.id}`);
            return true;
          } catch (error) {
            const errorMessage = `Failed to delete Stream user ${user.id}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`;
            console.error(errorMessage);
            errors.push(errorMessage);
            throw error;
          }
        })
      );

      // Analyze batch results
      // biome-ignore lint/complexity/noForEach: This is a simple loop
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          deletedCount++;
        } else {
          errorCount++;
        }
      });

      totalProcessed += batch.length;
      console.log("Batch progress:", {
        processed: totalProcessed,
        successful: deletedCount,
        failed: errorCount
      });

      if (i + batchSize < usersToDelete.length) {
        console.log("Rate limit pause between batches...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const successSummary = {
      success: true,
      duration: Date.now() - startTime,
      totalProcessed,
      deletedCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    };

    console.log("Stream cleanup completed:", successSummary);
    return successSummary;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Stream cleanup error:", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });

    return {
      success: false,
      duration: Date.now() - startTime,
      totalProcessed,
      deletedCount,
      errorCount,
      errors: [...errors, errorMessage],
      timestamp: new Date().toISOString()
    };
  } finally {
    try {
      await streamClient.disconnectUser();
      console.log("Stream client disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting Stream client:", error);
    }
  }
}

export async function GET(req: NextRequest) {
  console.log("Received Stream cleanup request");

  try {
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

    const authHeader = req.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET_KEY}`;

    if (!authHeader || authHeader !== expectedAuth) {
      console.warn("Unauthorized Stream cleanup attempt");
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

    const { apiKey, secret } = getStreamConfig();
    if (!apiKey || !secret) {
      console.error("Stream configuration missing");
      return new Response(
        JSON.stringify({
          error: "Stream configuration missing",
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

    const results = await cleanupStreamUsers();

    return new Response(JSON.stringify(results), {
      status: results.success ? 200 : 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("Stream cleanup route error:", {
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
