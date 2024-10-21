import { validateRequest } from "@zephyr/auth/auth";
import type { NotificationCountInfo } from "@zephyr/db";
import { prisma } from "@zephyr/db";

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unreadCount = await prisma.notification.count({
      where: {
        recipientId: user.id,
        read: false
      }
    });

    const data: NotificationCountInfo = {
      unreadCount
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
