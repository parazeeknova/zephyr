import { avatarCache, prisma } from "@zephyr/db";
import { followerInfoCache } from "@zephyr/db";
import { shareStatsCache } from "@zephyr/db";
import { tagCache } from "@zephyr/db";
import { redis } from "@zephyr/db";
import {
  POST_VIEWS_KEY_PREFIX,
  POST_VIEWS_SET,
  trendingTopicsCache
} from "@zephyr/db";

const BATCH_SIZE = 100;

async function validateRedisConnection() {
  try {
    await redis.ping();
    console.log("✅ Redis connection successful");
    return true;
  } catch (error) {
    console.error("❌ Redis connection failed:", error);
    return false;
  }
}

async function syncViewCounts() {
  console.log("\n📊 Syncing view counts...");
  try {
    const postsWithViews = await redis.smembers(POST_VIEWS_SET);
    console.log(`Found ${postsWithViews.length} posts with views in Redis`);

    if (postsWithViews.length === 0) {
      console.log("No posts found with views to sync");
      return;
    }

    const pipeline = redis.pipeline();
    for (const postId of postsWithViews) {
      pipeline.get(`${POST_VIEWS_KEY_PREFIX}${postId}`);
    }

    const results = await pipeline.exec();
    if (!results) {
      throw new Error("Pipeline execution returned null");
    }

    const updates = postsWithViews

      .map((postId, index) => {
        const [error, value] = results[index] || [];
        if (error) {
          console.log(`Error getting views for post ${postId}: ${error}`);
          return null;
        }
        return { postId, views: Number(value) || 0 };
      })
      .filter(
        (update): update is { postId: string; views: number } =>
          update !== null && update.views > 0
      );

    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = updates.slice(i, i + BATCH_SIZE);
      await prisma.$transaction(
        batch.map(({ postId, views }) =>
          prisma.post.update({
            where: { id: postId },
            data: { viewCount: views }
          })
        )
      );
      console.log(
        `Updated batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(updates.length / BATCH_SIZE)}`
      );
    }

    console.log(`✅ Synced view counts for ${updates.length} posts`);
  } catch (error) {
    console.error("❌ Error syncing view counts:", error);
  }
}

async function syncShareStats() {
  console.log("\n🔄 Syncing share stats...");
  try {
    const posts = await prisma.post.findMany({
      select: { id: true }
    });

    const platforms = ["twitter", "facebook", "linkedin"];
    let syncedCount = 0;

    for (const post of posts) {
      for (const platform of platforms) {
        const stats = await shareStatsCache.getStats(post.id, platform);
        if (stats.shares > 0 || stats.clicks > 0) {
          await prisma.shareStats.upsert({
            where: {
              postId_platform: {
                postId: post.id,
                platform
              }
            },
            create: {
              postId: post.id,
              platform,
              shares: stats.shares,
              clicks: stats.clicks
            },
            update: {
              shares: stats.shares,
              clicks: stats.clicks
            }
          });
          syncedCount++;
        }
      }
    }
    console.log(`✅ Synced ${syncedCount} share stats records`);
  } catch (error) {
    console.error("❌ Error syncing share stats:", error);
  }
}

async function syncTagCounts() {
  console.log("\n🏷️ Syncing tag counts...");
  try {
    await tagCache.syncTagCounts();
    console.log("✅ Successfully synced tag counts");
  } catch (error) {
    console.error("❌ Error syncing tag counts:", error);
  }
}

async function syncAvatars() {
  console.log("\n👤 Syncing avatar cache...");
  try {
    const users = await prisma.user.findMany({
      select: { id: true, avatarUrl: true, avatarKey: true }
    });

    let syncedCount = 0;
    for (const user of users) {
      if (user.avatarUrl) {
        await avatarCache.set(user.id, {
          url: user.avatarUrl,
          key: user.avatarKey || "",
          updatedAt: new Date().toISOString()
        });
        syncedCount++;
      }
    }
    console.log(`✅ Synced ${syncedCount} avatar records`);
  } catch (error) {
    console.error("❌ Error syncing avatars:", error);
  }
}

async function syncFollowerInfo() {
  console.log("\n👥 Syncing follower info...");
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        _count: {
          select: {
            followers: true,
            following: true
          }
        }
      }
    });

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (user) => {
          await followerInfoCache.set(user.id, {
            // @ts-expect-error
            followersCount: user._count.followers,
            followingCount: user._count.following,
            isFollowedByUser: false
          });
        })
      );
      console.log(
        `Processed batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(users.length / BATCH_SIZE)}`
      );
    }
    console.log(`✅ Synced follower info for ${users.length} users`);
  } catch (error) {
    console.error("❌ Error syncing follower info:", error);
  }
}

async function syncTrendingTopics() {
  console.log("\n📈 Syncing trending topics...");
  try {
    await trendingTopicsCache.warmCache();
    console.log("✅ Successfully warmed trending topics cache");
  } catch (error) {
    console.error("❌ Error syncing trending topics:", error);
  }
}

async function syncAllCaches() {
  console.log("🚀 Starting cache synchronization...");
  const startTime = Date.now();

  if (!(await validateRedisConnection())) {
    return;
  }

  try {
    await Promise.all([
      syncViewCounts(),
      syncShareStats(),
      syncTagCounts(),
      syncAvatars(),
      syncFollowerInfo(),
      syncTrendingTopics()
    ]);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✨ Cache synchronization completed in ${duration}s`);
  } catch (error) {
    console.error("\n❌ Fatal error during cache sync:", error);
  } finally {
    await prisma.$disconnect();
    await redis.quit();
  }
}

if (require.main === module) {
  syncAllCaches()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

export { syncAllCaches };
