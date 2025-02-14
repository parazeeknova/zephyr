import { prisma } from '@zephyr/db';
import { NextResponse } from 'next/server';

async function cleanupInactiveUsers() {
  const logs: string[] = [];
  const startTime = Date.now();

  const log = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  try {
    log('🚀 Starting inactive users cleanup job');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalUsers = await prisma.user.count();
    log(`📊 Current total users: ${totalUsers}`);

    const inactiveCount = await prisma.user.count({
      where: {
        AND: [{ emailVerified: false }, { createdAt: { lt: thirtyDaysAgo } }],
      },
    });

    log(
      `🔍 Found ${inactiveCount} inactive users (${((inactiveCount / totalUsers) * 100).toFixed(2)}% of total)`
    );

    if (inactiveCount === 0) {
      log('✨ No inactive users to clean up');
      return {
        success: true,
        deletedCount: 0,
        duration: Date.now() - startTime,
        logs,
        stats: {
          totalUsers,
          inactiveUsers: 0,
          deletionPercentage: '0.00',
        },
        timestamp: new Date().toISOString(),
      };
    }

    const batchSize = 100;
    let totalDeleted = 0;
    const totalBatches = Math.ceil(inactiveCount / batchSize);

    for (let offset = 0; offset < inactiveCount; offset += batchSize) {
      const currentBatch = Math.floor(offset / batchSize) + 1;
      log(`🔄 Processing batch ${currentBatch}/${totalBatches}`);

      try {
        const batch = await prisma.user.findMany({
          where: {
            AND: [
              { emailVerified: false },
              { createdAt: { lt: thirtyDaysAgo } },
            ],
          },
          select: {
            id: true,
            username: true,
            createdAt: true,
          },
          take: batchSize,
          skip: offset,
        });

        if (batch.length > 0) {
          // biome-ignore lint/complexity/noForEach: This is a simple loop
          batch.forEach((user) => {
            log(
              `📝 Queued for deletion: ${user.username} (Created: ${user.createdAt.toISOString()})`
            );
          });

          const deleteResult = await prisma.user.deleteMany({
            where: {
              id: { in: batch.map((user) => user.id) },
            },
          });

          totalDeleted += deleteResult.count;
          log(`✅ Batch ${currentBatch}: Deleted ${deleteResult.count} users`);
        }

        if (currentBatch < totalBatches) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      } catch (error) {
        const errorMessage = `Error processing batch ${currentBatch}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        log(`❌ ${errorMessage}`);
      }
    }

    const remainingUsers = await prisma.user.count();
    const deletionPercentage = ((totalDeleted / totalUsers) * 100).toFixed(2);

    const summary = {
      success: true,
      deletedCount: totalDeleted,
      duration: Date.now() - startTime,
      logs,
      stats: {
        totalUsersBefore: totalUsers,
        totalUsersAfter: remainingUsers,
        deletedUsers: totalDeleted,
        deletionPercentage,
      },
      timestamp: new Date().toISOString(),
    };

    log(`✨ Cleanup completed successfully:
    - Total Deleted: ${totalDeleted} users
    - Duration: ${summary.duration}ms
    - Before: ${totalUsers}
    - After: ${remainingUsers}
    - Cleaned: ${deletionPercentage}%`);

    return summary;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    log(`❌ Failed to cleanup inactive users: ${errorMessage}`);
    console.error(
      'Cleanup error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    );

    return {
      success: false,
      duration: Date.now() - startTime,
      error: errorMessage,
      logs,
      timestamp: new Date().toISOString(),
    };
  } finally {
    try {
      await prisma.$disconnect();
      log('👋 Database connection closed');
    } catch (_error) {
      log('❌ Error closing database connection');
    }
  }
}

export async function GET(request: Request) {
  console.log('📥 Received cleanup inactive users request');

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
      console.warn('⚠️ Unauthorized cleanup attempt');
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

    const results = await cleanupInactiveUsers();

    return NextResponse.json(results, {
      status: results.success ? 200 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('❌ Cleanup route error:', {
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
