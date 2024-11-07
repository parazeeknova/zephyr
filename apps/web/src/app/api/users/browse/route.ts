import { validateRequest } from "@zephyr/auth/auth";
import { getUserDataSelect, prisma } from "@zephyr/db";

export async function GET(request: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "followers";

    let orderBy: any = {};

    switch (sortBy) {
      case "followers":
        orderBy = {
          followers: {
            _count: "desc"
          }
        };
        break;
      case "posts":
        orderBy = {
          posts: {
            _count: "desc"
          }
        };
        break;
      case "newest":
        orderBy = {
          createdAt: "desc"
        };
        break;
      case "oldest":
        orderBy = {
          createdAt: "asc"
        };
        break;
      default:
        orderBy = {
          followers: {
            _count: "desc"
          }
        };
    }

    const users = await prisma.user.findMany({
      take: 20,
      where: {
        AND: [
          {
            id: {
              not: user.id
            }
          },
          {
            OR: [
              {
                username: {
                  contains: search,
                  mode: "insensitive"
                }
              },
              {
                displayName: {
                  contains: search,
                  mode: "insensitive"
                }
              }
            ]
          }
        ]
      },
      orderBy,
      select: getUserDataSelect(user.id)
    });

    return Response.json(users);
  } catch (_error) {
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
