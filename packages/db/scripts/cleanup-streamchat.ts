import { getStreamConfig, validateEnv } from "@zephyr/config/src/env";
import { StreamChat } from "stream-chat";
import prisma from "../src/prisma";

async function cleanupStreamChatUsers() {
  validateEnv();
  const { apiKey, secret } = getStreamConfig();

  const streamClient = StreamChat.getInstance(apiKey, secret);

  try {
    // Get all users from StreamChat
    const { users } = await streamClient.queryUsers({});
    console.log(`Found ${users.length} users in StreamChat`);

    // Get all user IDs from your database
    const dbUsers = await prisma.user.findMany({
      select: { id: true }
    });
    const dbUserIds = new Set(dbUsers.map((user) => user.id));
    console.log(`Found ${dbUserIds.size} users in database`);

    // Find StreamChat users that don't exist in your database
    const usersToDelete = users.filter((user) => !dbUserIds.has(user.id));
    console.log(`Found ${usersToDelete.length} StreamChat users to delete`);

    // Delete each user from StreamChat
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

// Run the cleanup
cleanupStreamChatUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
