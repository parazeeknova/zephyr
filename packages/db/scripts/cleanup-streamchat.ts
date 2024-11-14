import { getStreamConfig } from "@zephyr/config/src/env";
import { StreamChat } from "stream-chat";
import prisma from "../src/prisma";

process.env.IS_SCRIPT = "true";

async function cleanupStreamChatUsers() {
  const { apiKey, secret } = getStreamConfig();
  if (!apiKey || !secret) {
    throw new Error(
      "Stream Chat environment variables are required for this script. " +
        "Please set NEXT_PUBLIC_STREAM_CHAT_API_KEY and STREAM_CHAT_SECRET"
    );
  }

  const streamClient = StreamChat.getInstance(apiKey, secret);

  try {
    const { users } = await streamClient.queryUsers({});
    console.log(`Found ${users.length} users in StreamChat`);

    const dbUsers = await prisma.user.findMany({
      select: { id: true }
    });
    const dbUserIds = new Set(dbUsers.map((user) => user.id));
    console.log(`Found ${dbUserIds.size} users in database`);

    const usersToDelete = users.filter((user) => !dbUserIds.has(user.id));
    console.log(`Found ${usersToDelete.length} StreamChat users to delete`);

    for (const user of usersToDelete) {
      console.log(`Deleting StreamChat user: ${user.id}`);
      await streamClient.deleteUser(user.id, {
        mark_messages_deleted: true,
        hard_delete: true
      });
    }

    console.log("Cleanup completed successfully");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

cleanupStreamChatUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
