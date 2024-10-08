"use server";

import { unstable_cache } from "next/cache";

import prisma from "@zephyr/db/prisma";

export const getTrendingTopics = unstable_cache(
  async () => {
    const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
            SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
            FROM posts
            GROUP BY (hashtag)
            ORDER BY count DESC, hashtag ASC
            LIMIT 5
    `;

    return result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count)
    }));
  },
  ["trending_topics"],
  {
    revalidate: 3 * 60 * 60
  }
);
