import { prisma } from '@zephyr/db';
import { redis } from '@zephyr/db';
import { NextResponse } from 'next/server';

async function cleanupRedisCache() {
  const logs: string[] = [];
  const startTime = Date.now();

  const log = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  const results = {
    deletedPostViews: 0,
    cleanedTrendingTopics: 0,
    processedKeys: 0,
    errors: [] as string[],
  };

  try {
    try {
      await redis.ping();
      log('✅ Redis connection successful');
    } catch (error) {
      log('❌ Redis connection failed');
      console.error('Redis connection error:', error);
      return { success: false, logs, error: 'Redis connection failed' };
    }

    log('Starting Redis cache cleanup...');

    // 1. Clean up post views
    const postIdsWithViews = await redis.smembers('posts:with:views');
    log(`Found ${postIdsWithViews.length} posts with views to check`);

    const batchSize = 100;
    for (let i = 0; i < postIdsWithViews.length; i += batchSize) {
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(postIdsWithViews.length / batchSize);

      try {
        const batch = postIdsWithViews.slice(i, i + batchSize);
        results.processedKeys += batch.length;

        const existingPosts = await prisma.post.findMany({
          where: { id: { in: batch } },
          select: { id: true },
        });

        const existingPostIds = new Set(existingPosts.map((p) => p.id));
        const pipeline = redis.pipeline();
        let batchDeletions = 0;

        for (const postId of batch) {
          if (!existingPostIds.has(postId)) {
            pipeline.srem('posts:with:views', postId);
            pipeline.del(`post:views:${postId}`);
            batchDeletions++;
          }
        }

        await pipeline.exec();
        results.deletedPostViews += batchDeletions;

        log(
          `✅ Batch ${batchNumber}/${totalBatches}: processed ${batch.length} posts, deleted ${batchDeletions} views`
        );
      } catch (error) {
        const errorMessage = `Error processing batch ${batchNumber}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        log(`❌ ${errorMessage}`);
        results.errors.push(errorMessage);
      }
    }

    // 2. Clean up trending topics
    log('\nStarting trending topics cleanup...');
    try {
      const [currentTrendingTopics, backupTopics] = await Promise.all([
        redis.get('trending:topics'),
        redis.get('trending:topics:backup'),
      ]);

      let topics = [];
      if (currentTrendingTopics) {
        topics = JSON.parse(currentTrendingTopics);
        log(`Found ${topics.length} current trending topics`);
      } else if (backupTopics) {
        topics = JSON.parse(backupTopics);
        log(
          `Using ${topics.length} backup topics due to missing current topics`
        );
      } else {
        log('No trending topics found to clean');
      }

      if (topics.length > 0) {
        const validTopics = [];
        for (const topic of topics) {
          try {
            const postsWithHashtag = await prisma.post.count({
              where: {
                content: {
                  contains: topic.hashtag,
                  mode: 'insensitive',
                },
              },
            });

            if (postsWithHashtag > 0) {
              validTopics.push({
                hashtag: topic.hashtag,
                count: postsWithHashtag,
              });
              log(
                `✅ Topic ${topic.hashtag} validated with ${postsWithHashtag} posts`
              );
            } else {
              results.cleanedTrendingTopics++;
              log(`🧹 Removed inactive topic: ${topic.hashtag}`);
            }
          } catch (error) {
            const errorMessage = `Failed to process topic ${topic.hashtag}: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`;
            log(`❌ ${errorMessage}`);
            results.errors.push(errorMessage);
          }
        }

        if (results.cleanedTrendingTopics > 0) {
          const pipeline = redis.pipeline();
          pipeline.set(
            'trending:topics',
            JSON.stringify(validTopics),
            'EX',
            3600
          );
          pipeline.set(
            'trending:topics:backup',
            JSON.stringify(validTopics),
            'EX',
            86400
          );
          await pipeline.exec();
          log(
            `✅ Updated trending topics cache with ${validTopics.length} valid topics`
          );
        }
      }
    } catch (error) {
      const errorMessage = `Error processing trending topics: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`;
      log(`❌ ${errorMessage}`);
      results.errors.push(errorMessage);
    }

    const summary = {
      success: true,
      duration: Date.now() - startTime,
      ...results,
      logs,
      timestamp: new Date().toISOString(),
    };

    log('\n✅ Cache cleanup completed successfully');
    log(`📊 Summary:
    - Duration: ${summary.duration}ms
    - Deleted Views: ${summary.deletedPostViews}
    - Cleaned Topics: ${summary.cleanedTrendingTopics}
    - Processed Keys: ${summary.processedKeys}
    - Errors: ${summary.errors.length}`);

    return summary;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    log(`❌ Fatal error during cleanup: ${errorMessage}`);
    console.error(
      'Cleanup error stack:',
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
    try {
      await prisma.$disconnect();
      log('✅ Database connection closed');
    } catch (_error) {
      log('❌ Error closing database connection');
    }
  }
}

export async function GET(request: Request) {
  console.log('📥 Received Redis cleanup request');

  try {
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET_KEY}`;

    if (!process.env.CRON_SECRET_KEY) {
      console.error('❌ CRON_SECRET_KEY not configured');
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

    const result = await cleanupRedisCache();

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('❌ Route error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
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
