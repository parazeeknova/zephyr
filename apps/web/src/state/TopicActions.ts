'use server';

import { type TrendingTopic, prisma, trendingTopicsCache } from '@zephyr/db';

async function getTrendingTopicsFromDB(): Promise<TrendingTopic[]> {
  try {
    const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
      SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
      FROM posts
      GROUP BY (hashtag)
      ORDER BY count DESC, hashtag ASC
      LIMIT 10
    `;

    console.log('Database query result:', result);

    return result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count),
    }));
  } catch (error) {
    console.error('Error executing database query:', error);
    return [];
  }
}

trendingTopicsCache.refreshCache = async function (): Promise<TrendingTopic[]> {
  const topics = await getTrendingTopicsFromDB();
  await this.set(topics);
  return topics;
};

export async function invalidateTrendingTopicsCache(): Promise<
  TrendingTopic[]
> {
  try {
    const newTopics = await getTrendingTopicsFromDB();
    if (!newTopics || newTopics.length === 0) {
      throw new Error('No new topics found');
    }

    await trendingTopicsCache.set(newTopics);
    return newTopics;
  } catch (error) {
    console.error('Error in invalidateTrendingTopicsCache:', error);
    return getTrendingTopics();
  }
}

export async function getTrendingTopics(): Promise<TrendingTopic[]> {
  try {
    const cachedTopics = await trendingTopicsCache.get();

    if (cachedTopics && cachedTopics.length > 0) {
      if (await trendingTopicsCache.shouldRefresh()) {
        void backgroundRefreshTopics();
      }
      return cachedTopics;
    }

    const newTopics = await getTrendingTopicsFromDB();
    if (newTopics.length > 0) {
      await trendingTopicsCache.set(newTopics);
      return newTopics;
    }

    return [];
  } catch (error) {
    console.error('Error in getTrendingTopics:', error);
    return getTrendingTopicsFromDB();
  }
}

export async function backgroundRefreshTopics(): Promise<void> {
  try {
    const topics = await getTrendingTopicsFromDB();
    if (topics && topics.length > 0) {
      await trendingTopicsCache.set(topics);
    }
  } catch (error) {
    console.error('Error in background refresh:', error);
  }
}

export async function warmTrendingTopicsCache(): Promise<void> {
  await trendingTopicsCache.warmCache();
}
