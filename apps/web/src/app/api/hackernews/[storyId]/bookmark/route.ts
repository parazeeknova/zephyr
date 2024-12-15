import { validateRequest } from "@zephyr/auth/auth";
import { prisma } from "@zephyr/db";

export async function GET(
  _req: Request,
  props: { params: Promise<{ storyId: string }> }
) {
  const params = await props.params;
  const { storyId } = params;

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmark = await prisma.hNBookmark.findUnique({
      where: {
        userId_storyId: {
          userId: loggedInUser.id,
          storyId: Number.parseInt(storyId)
        }
      }
    });

    return Response.json({ isBookmarked: !!bookmark });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  _req: Request,
  props: { params: Promise<{ storyId: string }> }
) {
  const params = await props.params;
  const { storyId } = params;

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.hNBookmark.upsert({
      where: {
        userId_storyId: {
          userId: loggedInUser.id,
          storyId: Number.parseInt(storyId)
        }
      },
      create: {
        userId: loggedInUser.id,
        storyId: Number.parseInt(storyId)
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
  props: { params: Promise<{ storyId: string }> }
) {
  const params = await props.params;
  const { storyId } = params;

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.hNBookmark.deleteMany({
      where: {
        userId: loggedInUser.id,
        storyId: Number.parseInt(storyId)
      }
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
