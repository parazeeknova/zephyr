import { fetchStories, refreshHNCache } from "@/app/(main)/hackernews/api/hn";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "0");
    const limit = Number.parseInt(searchParams.get("limit") || "30");
    const search = searchParams.get("search") || undefined;

    const stories = await fetchStories(page, limit, search);

    return NextResponse.json({ stories });
  } catch (error) {
    console.error("Error fetching HN stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await refreshHNCache();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error refreshing HN cache:", error);
    return NextResponse.json(
      { error: "Failed to refresh cache" },
      { status: 500 }
    );
  }
}
