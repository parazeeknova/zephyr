import { validateRequest } from "@zephyr/auth/auth";
import { getUserDataSelect, prisma } from "@zephyr/db";

export async function GET(
  _req: Request,
  props: { params: Promise<{ username: string }> }
) {
  const params = await props.params;

  const { username } = params;

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive"
        }
      },
      select: getUserDataSelect(loggedInUser.id)
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
