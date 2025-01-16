import { tagCache } from "@zephyr/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q");

    // biome-ignore lint/suspicious/noImplicitAnyLet: This is a simple variable declaration
    let tags;
    if (query) {
      tags = await tagCache.searchTags(query);
    } else {
      tags = await tagCache.getPopularTags(10);
      tags = tags.map((t) => t.name);
    }

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json({ tags: [] }, { status: 500 });
  }
}
