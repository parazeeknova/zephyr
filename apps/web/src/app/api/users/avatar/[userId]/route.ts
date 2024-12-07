import { avatarCache, prisma } from "@zephyr/db";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = {
  userId: string;
};

type Context = {
  params: Params;
};

export async function GET(_request: NextRequest, { params }: Context) {
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
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
    }

    await avatarCache.set(userId, {
      url: user.avatarUrl,
      // biome-ignore lint/style/noNonNullAssertion: This is safe because we check for avatarUrl above
      key: user.avatarKey!,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      url: user.avatarUrl,
      key: user.avatarKey
    });
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
