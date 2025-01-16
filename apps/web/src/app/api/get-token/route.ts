import { validateRequest } from "@zephyr/auth/auth";
import { getStreamClient } from "@zephyr/auth/src";

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY;
    const apiSecret = process.env.STREAM_SECRET;

    console.debug("[Stream Token Debug]", {
      hasApiKey: !!apiKey,
      hasSecret: !!apiSecret,
      userId: user.id
    });

    if (!apiKey || !apiSecret) {
      console.error("[Stream Token] Missing configuration");
      return Response.json(
        { error: "Stream service misconfigured" },
        { status: 503 }
      );
    }

    const streamClient = getStreamClient();
    if (!streamClient) {
      console.error("[Stream Token] Failed to initialize client");
      return Response.json(
        { error: "Stream service unavailable" },
        { status: 503 }
      );
    }

    try {
      const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour
      const issuedAt = Math.floor(Date.now() / 1000) - 60; // 1 minute ago

      const token = streamClient.createToken(user.id, expirationTime, issuedAt);

      console.debug("[Stream Token] Generated successfully for user:", user.id);

      return Response.json({
        token,
        expiresAt: expirationTime
      });
    } catch (streamError) {
      console.error("[Stream Token] Generation error:", streamError);
      return Response.json(
        { error: "Failed to generate stream token" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Stream Token] Unexpected error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
