import { getStreamConfig } from '@zephyr/config/src/env';
import { prisma } from '@zephyr/db';
import { NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';

async function cleanupStreamUsers() {
  const logs: string[] = [];
  const startTime = Date.now();

  const log = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  let streamClient: StreamChat | null = null;
  const results = {
    deletedCount: 0,
    errorCount: 0,
    totalProcessed: 0,
    errors: [] as string[],
  };

  try {
    log('🚀 Starting Stream users cleanup process');

    const { apiKey, secret } = getStreamConfig();
    if (!apiKey || !secret) {
      throw new Error(
        '❌ Stream Chat configuration missing. Required: NEXT_PUBLIC_STREAM_CHAT_API_KEY and STREAM_CHAT_SECRET'
      );
    }

    streamClient = StreamChat.getInstance(apiKey, secret);
    log('✅ Stream client initialized successfully');

    log('📥 Fetching Stream users...');
    let allUsers: any[] = [];
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

        if (users.length === 0) break;

        allUsers = [...allUsers, ...users];
        offset += users.length;

        log(
          `📊 Fetched batch of ${users.length} users (total: ${allUsers.length})`
        );

        if (users.length < queryLimit) break;

        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        const errorMessage = `Error fetching users batch at offset ${offset}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        log(`❌ ${errorMessage}`);
        results.errors.push(errorMessage);
        break;
      }
    }

    log(`📊 Found ${allUsers.length} total Stream users`);

    log('🔍 Fetching database users...');
    const dbUsers = await prisma.user.findMany({
      select: { id: true },
    });
    log(`📊 Found ${dbUsers.length} database users`);

    const dbUserIds = new Set(dbUsers.map((user) => user.id));
    const usersToDelete = allUsers.filter((user) => !dbUserIds.has(user.id));

    const summary = {
      totalStreamUsers: allUsers.length,
      totalDbUsers: dbUserIds.size,
      usersToDelete: usersToDelete.length,
    };

    log(`📊 Analysis Summary:
    - Total Stream Users: ${summary.totalStreamUsers}
    - Total DB Users: ${summary.totalDbUsers}
    - Users to Delete: ${summary.usersToDelete}`);

    if (usersToDelete.length === 0) {
      log('✨ No orphaned Stream users found, cleanup not needed');
      return {
        success: true,
        duration: Date.now() - startTime,
        ...results,
        logs,
        timestamp: new Date().toISOString(),
      };
    }

    const deleteBatchSize = 25;
    for (let i = 0; i < usersToDelete.length; i += deleteBatchSize) {
      const batch = usersToDelete.slice(i, i + deleteBatchSize);
      const batchNumber = Math.floor(i / deleteBatchSize) + 1;
      const totalBatches = Math.ceil(usersToDelete.length / deleteBatchSize);

      log(
        `🔄 Processing deletion batch ${batchNumber}/${totalBatches} (${batch.length} users)`
      );

      const batchResults = await Promise.allSettled(
        batch.map(async (user) => {
          try {
            await streamClient?.deleteUser(user.id, {
              mark_messages_deleted: true,
              hard_delete: true,
            });
            log(`✅ Deleted Stream user: ${user.id}`);
            return true;
          } catch (error) {
            const errorMessage = `Failed to delete Stream user ${user.id}: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`;
            log(`❌ ${errorMessage}`);
            results.errors.push(errorMessage);
            throw error;
          }
        })
      );

      // Process batch results
      // biome-ignore lint/complexity/noForEach: Disable rule for this block
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.deletedCount++;
        } else {
          results.errorCount++;
        }
      });

      results.totalProcessed += batch.length;
      log(`📊 Batch ${batchNumber} Progress:
      - Processed: ${results.totalProcessed}/${usersToDelete.length}
      - Successful: ${results.deletedCount}
      - Failed: ${results.errorCount}`);

      if (i + deleteBatchSize < usersToDelete.length) {
        log('⏳ Rate limit pause between deletion batches...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const successSummary = {
      success: true,
      duration: Date.now() - startTime,
      ...results,
      logs,
      timestamp: new Date().toISOString(),
    };

    log(`✨ Stream cleanup completed successfully
    Duration: ${successSummary.duration}ms
    Total Processed: ${successSummary.totalProcessed}
    Deleted: ${successSummary.deletedCount}
    Errors: ${successSummary.errorCount}`);

    return successSummary;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    log(`❌ Fatal error during Stream cleanup: ${errorMessage}`);
    console.error(
      'Stream cleanup error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    );

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
      } catch (error) {
        log('❌ Error disconnecting Stream client');
        console.error('Disconnect error:', error);
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
  console.log('📥 Received Stream cleanup request');

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
      console.warn('⚠️ Unauthorized Stream cleanup attempt');
      return NextResponse.json(
        {
          error: 'Unauthorized',
          timestamp: new Date().toISOString(),
        },
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    const { apiKey, secret } = getStreamConfig();
    if (!apiKey || !secret) {
      console.error('❌ Stream configuration missing');
      return NextResponse.json(
        {
          error: 'Stream configuration missing',
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

    const results = await cleanupStreamUsers();

    return NextResponse.json(results, {
      status: results.success ? 200 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('❌ Stream cleanup route error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

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
