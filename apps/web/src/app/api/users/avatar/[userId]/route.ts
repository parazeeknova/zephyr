import { prisma } from "@zephyr/db";
import { avatarCache } from "@zephyr/db/cache/avatar-cache";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const cachedAvatar = await avatarCache.get(userId);
    if (cachedAvatar) {
      return NextResponse.json(cachedAvatar);
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        avatarUrl: true,
        avatarKey: true
      }
    });

    if (!user?.avatarUrl) {
      return new NextResponse("Avatar not found", { status: 404 });
    }

    await avatarCache.set(userId, {
      url: user.avatarUrl,
      // biome-ignore lint/style/noNonNullAssertion: We know `user.avatarKey` is defined
      key: user.avatarKey!,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      url: user.avatarUrl,
      key: user.avatarKey
    });
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
