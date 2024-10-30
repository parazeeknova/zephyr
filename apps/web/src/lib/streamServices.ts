import { StreamChat } from "stream-chat";

// Lazy initialization for Stream Chat
let streamClient: StreamChat | null = null;

export function initializeStreamChat() {
  if (!streamClient) {
    const key = process.env.NEXT_PUBLIC_STREAM_KEY;
    const secret = process.env.STREAM_SECRET;

    if (!key || !secret) {
      console.warn("Stream Chat credentials not configured");
      return null;
    }

    streamClient = StreamChat.getInstance(key, secret);
  }
  return streamClient;
}

export function getStreamClient() {
  return streamClient;
}

// Initialize only when explicitly called
export async function createStreamUser(
  userId: string,
  username: string,
  displayName: string
) {
  const client = initializeStreamChat();
  if (!client) {
    console.warn("Skipping Stream user creation - Stream Chat not configured");
    return;
  }

  try {
    await client.upsertUser({
      id: userId,
      username,
      name: displayName
    });
  } catch (error) {
    console.error("Failed to create Stream user:", error);
    // Don't throw - allow the auth flow to continue even if Stream fails
  }
}
