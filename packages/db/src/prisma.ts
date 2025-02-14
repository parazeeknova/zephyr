import { PrismaClient } from '@prisma/client';
import {
  getEnvironmentMode,
  getStreamConfig,
  isStreamConfigured,
} from '@zephyr/config/src/env';
import { StreamChat } from 'stream-chat';

const { isDevelopment } = getEnvironmentMode();

function initializeStreamClient(): StreamChat | null {
  if (!isStreamConfigured()) {
    isDevelopment &&
      console.log('Stream Chat is not configured - skipping initialization');
    return null;
  }

  const { apiKey, secret } = getStreamConfig();

  if (!apiKey || !secret) {
    isDevelopment &&
      console.log(
        'Stream Chat credentials are missing - skipping initialization'
      );
    return null;
  }

  try {
    const client = StreamChat.getInstance(apiKey, secret);
    isDevelopment && console.log('Stream Chat client initialized successfully');
    return client;
  } catch (error) {
    console.error('[Stream Chat] Initialization failed:', error);
    return null;
  }
}

const streamClient = initializeStreamClient();

async function handleStreamUserDeletion(userId: string): Promise<void> {
  if (!streamClient) {
    isDevelopment &&
      console.log('Stream Chat client not available - skipping user deletion');
    return;
  }

  try {
    await streamClient.deleteUser(userId, {
      mark_messages_deleted: true,
      hard_delete: true,
    });
    isDevelopment &&
      console.log(`Stream Chat user deleted successfully: ${userId}`);
  } catch (error) {
    console.error('[Stream Chat] Failed to delete user:', {
      userId,
      error: error instanceof Error ? error.message : error,
    });
  }
}

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    query: {
      user: {
        async delete({ args, query }) {
          const deletedUser = await query(args);

          if (deletedUser?.id) {
            await handleStreamUserDeletion(deletedUser.id);
          }

          return deletedUser;
        },
      },
    },
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
