import { getStreamClient } from "./stream";

export const createStreamUser = async (
  userId: string,
  username: string,
  displayName: string
) => {
  try {
    const client = getStreamClient();
    if (!client) {
      console.log("Skipping Stream user creation - client not initialized");
      return;
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
