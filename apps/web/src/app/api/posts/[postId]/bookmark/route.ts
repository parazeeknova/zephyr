import { validateRequest } from "@zephyr/auth/auth";
import type { BookmarkInfo } from "@zephyr/db";
import { prisma } from "@zephyr/db";

export async function GET(
  _req: Request,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;

  const { postId } = params;

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: loggedInUser.id,
          postId
        }
      }
    });

    const data: BookmarkInfo = {
      isBookmarkedByUser: !!bookmark
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  _req: Request,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;

  const { postId } = params;

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.bookmark.upsert({
      where: {
        userId_postId: {
          userId: loggedInUser.id,
          postId
        }
      },
      create: {
        userId: loggedInUser.id,
        postId
      },
      update: {}
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;

  const { postId } = params;

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.bookmark.deleteMany({
      where: {
        userId: loggedInUser.id,
        postId
      }
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
