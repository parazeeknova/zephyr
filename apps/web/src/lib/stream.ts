import { getStreamConfig, isStreamConfigured } from "@zephyr/config/src/env";
import { StreamChat } from "stream-chat";

let streamClient: StreamChat | null = null;

export function getStreamClient(): StreamChat | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!streamClient && isStreamConfigured()) {
    const config = getStreamConfig();
    if (config.apiKey && config.secret) {
      console.log(
        "Initializing Stream client with API key:",
        `${config.apiKey.substring(0, 5)}...`
      );
      streamClient = StreamChat.getInstance(config.apiKey, config.secret);
    }
  }

  return streamClient;
}

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
