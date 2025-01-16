import { tagCache } from "@zephyr/db";
import { prisma } from "@zephyr/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const popularTags = await tagCache.getPopularTags(10);

    const tagsWithDetails = await Promise.all(
      popularTags.map(async (tag) => {
        const dbTag = await prisma.tag.findUnique({
          where: { name: tag.name },
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: { posts: true }
            }
          }
        });

        return {
          id: dbTag?.id || tag.name,
          name: tag.name,
          useCount: dbTag?._count.posts || tag.count,
          createdAt: dbTag?.createdAt || new Date(),
          updatedAt: dbTag?.updatedAt || new Date()
        };
      })
    );

    return NextResponse.json({ tags: tagsWithDetails });
  } catch (error) {
    console.error("Error fetching popular tags:", error);
    return NextResponse.json({ tags: [] }, { status: 500 });
  }
}
