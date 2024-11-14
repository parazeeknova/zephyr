import { getStreamConfig, isStreamConfigured } from "@zephyr/config/src/env";
import { StreamChat } from "stream-chat";

let streamClient: StreamChat | null = null;

export function getStreamClient(): StreamChat {
  if (!streamClient && isStreamConfigured()) {
    const config = getStreamConfig();
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
    return client.createToken(userId);
  } catch (error) {
    console.warn("Failed to generate Stream user token:", error);
    return null;
  }
}
