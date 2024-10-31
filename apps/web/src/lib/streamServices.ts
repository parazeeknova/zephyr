import { getStreamClient } from "./stream";

export const createStreamUser = async (
  userId: string,
  username: string,
  displayName: string
) => {
  try {
    const client = getStreamClient();
    if (!client) {
      console.warn("Skipping Stream user creation - client not initialized");
      return;
    }

    await client.upsertUser({
      id: userId,
      username,
      name: displayName
    });
  } catch (error) {
    console.warn("Failed to create Stream user:", error);
    // Don't throw - allow the auth flow to continue
  }
};
