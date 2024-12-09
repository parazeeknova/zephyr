import { validateRequest } from "@zephyr/auth/auth";
import { getStreamClient } from "@zephyr/auth/src";
import type { MessageCountInfo } from "@zephyr/db";

export async function GET() {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const streamClient = getStreamClient();
    if (!streamClient) {
      console.warn("Stream client not initialized");
      return Response.json(
        {
          unreadCount: 0,
          error: "Stream service unavailable"
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate"
          }
        }
      );
    }

    try {
      const { total_unread_count } = await streamClient.getUnreadCount(user.id);

      const data: MessageCountInfo = {
        unreadCount: total_unread_count
      };

      return Response.json(data, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate"
        }
      });
    } catch (streamError) {
      console.error("Stream getUnreadCount error:", streamError);
      return Response.json(
        {
          unreadCount: 0,
          error: "Failed to fetch unread count"
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate"
          }
        }
      );
    }
  } catch (error) {
    console.error("Unread count error:", error);
    return Response.json(
      {
        unreadCount: 0,
        error: "Internal server error"
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate"
        }
      }
    );
  }
}
