import { getStreamConfig } from '@zephyr/config/src/env';
import { prisma } from '@zephyr/db';
import { NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex logic is required here
async function syncStreamUsers() {
  const logs: string[] = [];
  const startTime = Date.now();

  const log = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  let streamClient: StreamChat | null = null;
  const results = {
    updatedCount: 0,
    errorCount: 0,
    totalProcessed: 0,
    errors: [] as string[],
  };

  try {
    log('🚀 Starting Stream users sync process');

    const { apiKey, secret } = getStreamConfig();
    if (!apiKey || !secret) {
      throw new Error(
        '❌ Stream Chat configuration missing. Required: NEXT_PUBLIC_STREAM_CHAT_API_KEY and STREAM_CHAT_SECRET'
      );
    }

    streamClient = StreamChat.getInstance(apiKey, secret);
    log('✅ Stream client initialized successfully');

    log('📥 Fetching Stream users...');
    // biome-ignore lint/suspicious/noExplicitAny: Any type is used here due to Stream SDK limitations
    let allStreamUsers: any[] = [];
    let offset = 0;
    const queryLimit = 100;

    while (true) {
      try {
        const { users } = await streamClient.queryUsers(
          {},
          { last_active: -1 },
          {
            limit: queryLimit,
            offset: offset,
          }
        );

        if (users.length === 0) {
          break;
        }

        allStreamUsers = [...allStreamUsers, ...users];
        offset += users.length;

        log(
          `📊 Fetched batch of ${users.length} users (total: ${allStreamUsers.length})`
        );

        if (users.length < queryLimit) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        const errorMessage = `Error fetching users batch at offset ${offset}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        log(`❌ ${errorMessage}`);
        results.errors.push(errorMessage);
        break;
      }
    }

    log(`📊 Found ${allStreamUsers.length} total Stream users`);

    log('🔍 Fetching database users...');
    const dbUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
      },
    });
    log(`📊 Found ${dbUsers.length} database users`);

    const usersToUpdate = dbUsers.filter((dbUser) => {
      const streamUser = allStreamUsers.find((u) => u.id === dbUser.id);
      return (
        streamUser &&
        (streamUser.username !== dbUser.username ||
          streamUser.name !== dbUser.displayName)
      );
    });

    log(`📊 Found ${usersToUpdate.length} users that need updating`);

    const updateBatchSize = 25;
    for (let i = 0; i < usersToUpdate.length; i += updateBatchSize) {
      const batch = usersToUpdate.slice(i, i + updateBatchSize);
      const batchNumber = Math.floor(i / updateBatchSize) + 1;
      const totalBatches = Math.ceil(usersToUpdate.length / updateBatchSize);

      log(
        `🔄 Processing update batch ${batchNumber}/${totalBatches} (${batch.length} users)`
      );

      const batchResults = await Promise.allSettled(
        batch.map(async (user) => {
          try {
            await streamClient?.upsertUser({
              id: user.id,
              username: user.username,
              name: user.displayName,
            });
            log(`✅ Updated Stream user: ${user.id}`);
            return true;
          } catch (error) {
            const errorMessage = `Failed to update Stream user ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            log(`❌ ${errorMessage}`);
            results.errors.push(errorMessage);
            throw error;
          }
        })
      );

      // biome-ignore lint/complexity/noForEach: This is a simple loop
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.updatedCount++;
        } else {
          results.errorCount++;
        }
      });

      results.totalProcessed += batch.length;
      log(`📊 Batch ${batchNumber} Progress:
      - Processed: ${results.totalProcessed}/${usersToUpdate.length}
      - Successful: ${results.updatedCount}
      - Failed: ${results.errorCount}`);

      if (i + updateBatchSize < usersToUpdate.length) {
        log('⏳ Rate limit pause between update batches...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return {
      success: true,
      duration: Date.now() - startTime,
      ...results,
      logs,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    log(`❌ Fatal error during Stream sync: ${errorMessage}`);

    return {
      success: false,
      duration: Date.now() - startTime,
      ...results,
      logs,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };
  } finally {
    if (streamClient) {
      try {
        await streamClient.disconnectUser();
        log('👋 Stream client disconnected successfully');
      } catch (_error) {
        log('❌ Error disconnecting Stream client');
      }
    }

    try {
      await prisma.$disconnect();
      log('👋 Database connection closed');
    } catch (_error) {
      log('❌ Error closing database connection');
    }
  }
}

export async function GET(request: Request) {
  console.log('📥 Received Stream sync request');

  try {
    if (!process.env.CRON_SECRET_KEY) {
      console.error('❌ CRON_SECRET_KEY environment variable not set');
      return NextResponse.json(
        {
          error: 'Server configuration error',
          timestamp: new Date().toISOString(),
        },
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET_KEY}`;

    if (!authHeader || authHeader !== expectedAuth) {
      console.warn('⚠️ Unauthorized Stream sync attempt');
      return NextResponse.json(
        { error: 'Unauthorized', timestamp: new Date().toISOString() },
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    const results = await syncStreamUsers();

    return NextResponse.json(results, {
      status: results.success ? 200 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('❌ Stream sync route error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
