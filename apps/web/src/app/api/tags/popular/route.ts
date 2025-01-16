import { tagCache } from "@zephyr/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const popularTags = await tagCache.getPopularTags(10);

    const formattedTags = popularTags.map((tag) => ({
      id: tag.name,
      name: tag.name,
      useCount: tag.count,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    return NextResponse.json({ tags: formattedTags });
  } catch (error) {
    console.error("Error fetching popular tags:", error);
    return NextResponse.json({ tags: [] }, { status: 500 });
  }
}
