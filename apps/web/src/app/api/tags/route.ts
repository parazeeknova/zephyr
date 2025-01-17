import { prisma, tagCache } from "@zephyr/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q")?.toLowerCase();

    let tags: string[] = [];

    if (query) {
      // First try cache
      tags = await tagCache.searchTags(query);

      // If no results, try direct DB query
      if (!tags || tags.length === 0) {
        const dbTags = await prisma.tag.findMany({
          where: {
            name: {
              contains: query,
              mode: "insensitive"
            }
          },
          take: 10,
          orderBy: {
            name: "asc"
          }
        });
        tags = dbTags.map((t) => t.name);
      }

      // Always include the query as a suggestion if it's not already there
      if (!tags.includes(query)) {
        tags.unshift(query);
      }
    } else {
      // Get popular tags if no query
      const popularTags = await tagCache.getPopularTags(10);
      tags = popularTags.map((t) => t.name);
    }

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json({ tags: [] });
  }
}
