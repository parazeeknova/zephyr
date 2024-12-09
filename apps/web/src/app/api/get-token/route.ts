import { validateRequest } from "@zephyr/auth/auth";
import { getStreamClient } from "@zephyr/auth/src";

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const streamClient = getStreamClient();
    if (!streamClient) {
      console.error("Failed to initialize Stream client");
      return Response.json(
        { error: "Stream service unavailable" },
        { status: 503 }
      );
    }

    try {
      const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour
      const issuedAt = Math.floor(Date.now() / 1000) - 60; // 1 minute ago

      if (!process.env.NEXT_PUBLIC_STREAM_KEY || !process.env.STREAM_SECRET) {
        console.error("Stream configuration missing");
        return Response.json(
          { error: "Stream service misconfigured" },
          { status: 503 }
        );
      }

      const token = streamClient.createToken(user.id, expirationTime, issuedAt);

      return Response.json({
        token,
        expiresAt: expirationTime
      });
    } catch (streamError) {
      console.error("Stream token generation error:", streamError);
      return Response.json(
        { error: "Failed to generate stream token" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Token generation error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
