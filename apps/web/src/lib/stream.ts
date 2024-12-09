import { getStreamConfig, isStreamConfigured } from "@zephyr/config/src/env";
import { StreamChat } from "stream-chat";

let streamClient: StreamChat | null = null;

export function getStreamClient(): StreamChat {
  if (!streamClient && isStreamConfigured()) {
    const config = getStreamConfig();
    console.log(
      "Initializing Stream client with API key:",
      `${config.apiKey.substring(0, 5)}...`
    );
    streamClient = StreamChat.getInstance(config.apiKey, config.secret);
  }

  if (!streamClient) {
    throw new Error("Stream client not initialized - missing configuration");
  }

  return streamClient;
}

export function generateStreamUserToken(userId: string): string | null {
  try {
    const client = getStreamClient();
    const token = client.createToken(userId);
    console.log("Generated token for user:", `${userId.substring(0, 5)}...`);
    return token;
  } catch (error) {
    console.error("Failed to generate Stream user token:", error);
    return null;
  }
}
