import { deleteAvatar, uploadAvatar } from "@/lib/minio";
import { getStreamClient } from "@/lib/stream";
import { prisma } from "@zephyr/db";
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

    if (oldAvatarKey) {
      await deleteAvatar(oldAvatarKey);
    }

    const streamClient = getStreamClient();
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: result.url,
        avatarKey: result.key
      }
    });

    await streamClient.partialUpdateUser({
      id: userId,
      set: {
        image: result.url
      }
    });

    return NextResponse.json({ user: updatedUser, avatar: result });
  } catch (error) {
    console.error("Avatar update error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
