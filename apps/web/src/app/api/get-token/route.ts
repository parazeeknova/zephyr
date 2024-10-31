import { getStreamClient } from "@/lib/stream";
import { validateRequest } from "@zephyr/auth/auth";

export async function GET() {
  try {
    const { user } = await validateRequest();
    console.log("Calling get-token for user: ", user?.id);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const streamClient = getStreamClient();

    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now
    const issuedAt = Math.floor(Date.now() / 1000) - 60; // 1 minute ago

    const token = streamClient.createToken(user.id, expirationTime, issuedAt);

    return Response.json({ token });
  } catch (error) {
    console.error("Stream token generation error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
