import { getStreamConfig, isStreamConfigured } from "@zephyr/config/src/env";
import { StreamChat } from "stream-chat";

let streamClient: StreamChat | null = null;

export function getStreamClient(): StreamChat | null {
  if (
    !streamClient &&
    process.env.NEXT_PUBLIC_STREAM_KEY &&
    process.env.STREAM_SECRET
  ) {
    try {
      streamClient = StreamChat.getInstance(
        process.env.NEXT_PUBLIC_STREAM_KEY,
        process.env.STREAM_SECRET
      );
      console.log("Stream client initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Stream client:", error);
      return null;
    }
  }

  if (typeof window !== "undefined" && !streamClient && isStreamConfigured()) {
    const config = getStreamConfig();
    if (config.apiKey && config.secret) {
      try {
        streamClient = StreamChat.getInstance(config.apiKey, config.secret);
        console.log(
          "Initializing Stream client with API key:",
          `${config.apiKey.substring(0, 5)}...`
        );
      } catch (error) {
        console.error("Failed to initialize Stream client:", error);
        return null;
      }
    }
  }

  return streamClient;
}

export const createStreamUser = async (
  userId: string,
  username: string,
  displayName: string
) => {
  try {
    let client = getStreamClient();
    if (!client) {
      console.log("Stream client not initialized - retrying once");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const retryClient = getStreamClient();
      if (!retryClient) {
        console.warn(
          "Stream client still not available - skipping user creation"
        );
        return;
      }
      client = retryClient;
    }

    console.log("Creating Stream user:", {
      userId: `${userId.substring(0, 5)}...`,
      username: `${username.substring(0, 5)}...`
    });

    await client.upsertUser({
      id: userId,
      username,
      name: displayName
    });

    console.log("Successfully created Stream user");
  } catch (error) {
    console.error("Failed to create Stream user:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      });
    }
  }
};

export function generateStreamUserToken(userId: string): string | null {
  try {
    const client = getStreamClient();
    if (!client) return null;

    const token = client.createToken(userId);
    console.log("Generated token for user:", `${userId.substring(0, 5)}...`);
    return token;
  } catch (error) {
    console.error("Failed to generate Stream user token:", error);
    return null;
  }
}
