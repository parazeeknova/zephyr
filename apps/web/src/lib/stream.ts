import { StreamChat } from "stream-chat";

let streamClient: StreamChat | null = null;

export const initializeStreamClient = () => {
  if (
    !streamClient &&
    process.env.NEXT_PUBLIC_STREAM_KEY &&
    process.env.STREAM_SECRET
  ) {
    streamClient = StreamChat.getInstance(
      process.env.NEXT_PUBLIC_STREAM_KEY,
      process.env.STREAM_SECRET
    );
  }
  return streamClient;
};

// Get or initialize stream client
export const getStreamClient = () => {
  return streamClient || initializeStreamClient();
};

type StreamUserData = {
  id: string;
  username: string;
  name?: string;
};

type StreamUserPartialData = {
  id: string;
  set?: Partial<{
    username: string;
    name: string;
    image: string;
    [key: string]: any;
  }>;
  unset?: string[];
};

interface UnreadCount {
  total_unread_count: number;
  channels?: { [key: string]: number };
}

// Utility functions for common operations
export const streamOperations = {
  async upsertUser(userData: StreamUserData) {
    const client = getStreamClient();
    if (!client) {
      console.warn("Stream client not initialized - skipping user creation");
      return;
    }

    try {
      await client.upsertUser({
        id: userData.id,
        username: userData.username,
        name: userData.name || userData.username
      });
    } catch (error) {
      console.error("Failed to upsert Stream user:", error);
    }
  },

  async deleteUser(userId: string) {
    const client = getStreamClient();
    if (!client) {
      console.warn("Stream client not initialized - skipping user deletion");
      return;
    }

    try {
      await client.deleteUser(userId, {
        mark_messages_deleted: true,
        hard_delete: true
      });
    } catch (error) {
      console.error("Failed to delete Stream user:", error);
    }
  },

  async partialUpdateUser(updateData: StreamUserPartialData) {
    const client = getStreamClient();
    if (!client) {
      console.warn("Stream client not initialized - skipping user update");
      return;
    }

    try {
      await client.partialUpdateUser(updateData);
    } catch (error) {
      console.error("Failed to update Stream user:", error);
    }
  },

  async getUnreadCount(userId: string): Promise<UnreadCount> {
    const client = getStreamClient();
    if (!client) {
      console.warn(
        "Stream client not initialized - returning zero unread count"
      );
      return { total_unread_count: 0 };
    }

    try {
      // biome-ignore lint/correctness/noUnusedVariables: <explanation>
      const user = await client.connectUser(
        { id: userId },
        client.devToken(userId)
      );
      const filter = { members: { $in: [userId] } };
      const channels = await client.queryChannels(filter);

      let total_unread_count = 0;
      const channelCounts: { [key: string]: number } = {};

      for (const channel of channels) {
        const channelId = channel.cid;
        if (channelId) {
          const count = channel.countUnread();
          channelCounts[channelId] = count;
          total_unread_count += count;
        }
      }

      await client.disconnectUser();

      return {
        total_unread_count,
        channels: channelCounts
      };
    } catch (error) {
      console.error("Failed to get unread count:", error);
      return { total_unread_count: 0 };
    }
  },

  createToken(userId: string, expiresAt: number, issuedAt: number): string {
    const client = getStreamClient();
    if (!client) {
      throw new Error("Stream client not initialized");
    }

    try {
      return client.createToken(userId, expiresAt, issuedAt);
    } catch (error) {
      console.error("Failed to create token:", error);
      throw error;
    }
  }
};

// For backward compatibility
export const streamServerClient = streamOperations;

// Export types for use in other files
export type { StreamUserData, StreamUserPartialData, UnreadCount };
