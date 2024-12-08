import { deleteAvatar, uploadAvatar } from "@/lib/minio";
import { getStreamClient } from "@/lib/stream";
import { prisma } from "@zephyr/db";
import { avatarCache } from "@zephyr/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const oldAvatarKey = formData.get("oldAvatarKey") as string;

    if (!file || !userId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const result = await uploadAvatar(file, userId);

    const avatarUrl =
      process.env.NODE_ENV === "production"
        ? result.url.replace("http://", "https://")
        : result.url;

    if (oldAvatarKey) {
      await deleteAvatar(oldAvatarKey);
    }

    const streamClient = getStreamClient();
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: avatarUrl,
        avatarKey: result.key
      }
    });

    await avatarCache.set(userId, {
      url: avatarUrl,
      key: result.key,
      updatedAt: new Date().toISOString()
    });

    await streamClient.partialUpdateUser({
      id: userId,
      set: {
        image: avatarUrl
      }
    });

    return NextResponse.json({
      user: updatedUser,
      avatar: { ...result, url: avatarUrl }
    });
  } catch (error) {
    console.error("Avatar update error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

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
