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

export async function invalidateTrendingTopicsCache(): Promise<
  TrendingTopic[]
> {
  try {
    // Get new data first
    const newTopics = await getTrendingTopicsFromDB();
    if (!newTopics || newTopics.length === 0) {
      throw new Error("No new topics found");
    }

    // Update cache with new data
    await trendingTopicsCache.set(newTopics);
    return newTopics;
  } catch (error) {
    console.error("Error in invalidateTrendingTopicsCache:", error);
    return getTrendingTopics();
  }
}

export async function getTrendingTopics(): Promise<TrendingTopic[]> {
  try {
    const cachedTopics = await trendingTopicsCache.get();

    if (!cachedTopics || cachedTopics.length === 0) {
      const newTopics = await getTrendingTopicsFromDB();
      await trendingTopicsCache.set(newTopics);
      return newTopics;
    }

    // Background refresh if needed
    if (await trendingTopicsCache.shouldRefresh()) {
      void trendingTopicsCache.refreshCache();
    }

    return cachedTopics;
  } catch (error) {
    console.error("Error in getTrendingTopics:", error);
    return getTrendingTopicsFromDB();
  }
}

export async function warmTrendingTopicsCache(): Promise<void> {
  await trendingTopicsCache.warmCache();
}
