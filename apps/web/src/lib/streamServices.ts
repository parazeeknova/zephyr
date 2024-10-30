let streamClient: any = null;

export const initializeStream = async () => {
  if (!streamClient) {
    try {
      const { getStreamClient } = await import("./stream");
      streamClient = await getStreamClient();
    } catch (error) {
      console.warn("Failed to initialize Stream client:", error);
    }
  }
  return streamClient;
};

export const createStreamUser = async (
  userId: string,
  username: string,
  displayName: string
) => {
  try {
    const client = await initializeStream();
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
