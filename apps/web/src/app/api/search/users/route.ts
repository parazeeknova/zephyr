import { validateRequest } from "@zephyr/auth/auth";
import { getUserDataSelect, prisma } from "@zephyr/db";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const q = searchParams.get("q") || "";
    const cursor = searchParams.get("cursor");
    const searchQuery = q.split(" ").join(" & ");
    const pageSize = 5;

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { displayName: { search: searchQuery } },
          { username: { search: searchQuery } },
          { bio: { search: searchQuery } }
        ]
      },
      select: getUserDataSelect(user.id),
      orderBy: [
        {
          followers: {
            _count: "desc"
          }
        },
        { createdAt: "desc" }
      ],
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined
    });

    const nextCursor = users.length > pageSize ? users[pageSize].id : null;

    return Response.json({
      users: users.slice(0, pageSize),
      nextCursor
    });
  } catch (error) {
    console.error("Error in user search API:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
