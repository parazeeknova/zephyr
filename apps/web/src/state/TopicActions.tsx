"use server";

import { type TrendingTopic, prisma, trendingTopicsCache } from "@zephyr/db";

// Separate database query function
async function getTrendingTopicsFromDB(): Promise<TrendingTopic[]> {
  const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
    SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
    FROM "posts"
    WHERE "createdAt" > NOW() - INTERVAL '24 hours'
    GROUP BY (hashtag)
    ORDER BY count DESC, hashtag ASC
    LIMIT 8
  `;

  return result.map((row) => ({
    hashtag: row.hashtag,
    count: Number(row.count)
  }));
}

// Initialize the refreshCache function
trendingTopicsCache.refreshCache = async function (): Promise<TrendingTopic[]> {
  const topics = await getTrendingTopicsFromDB();
  await this.set(topics);
  return topics;
};

export async function getTrendingTopics(): Promise<TrendingTopic[]> {
  try {
    const cachedTopics = await trendingTopicsCache.get();

    if (cachedTopics && (await trendingTopicsCache.shouldRefresh())) {
      // Don't await, let it refresh in background
      void trendingTopicsCache.refreshCache();
      return cachedTopics;
    }

    if (!cachedTopics) {
      return await trendingTopicsCache.refreshCache();
    }

    return cachedTopics;
  } catch (error) {
    console.error("Error in getTrendingTopics:", error);

    const backupTopics = await trendingTopicsCache.getBackup();
    if (backupTopics) return backupTopics;

    return getTrendingTopicsFromDB();
  }
}

export async function invalidateTrendingTopicsCache(): Promise<void> {
  await trendingTopicsCache.invalidate();
}

export async function warmTrendingTopicsCache(): Promise<void> {
  await trendingTopicsCache.warmCache();
}
