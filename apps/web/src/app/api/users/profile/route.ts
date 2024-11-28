import { deleteAvatar, uploadAvatar } from "@/lib/minio";
import { getStreamClient } from "@/lib/stream";
import { prisma } from "@zephyr/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const values = JSON.parse(formData.get("values") as string);
    const avatar = formData.get("avatar") as File;
    const userId = formData.get("userId") as string;
    const oldAvatarKey = formData.get("oldAvatarKey") as string;

    // biome-ignore lint/suspicious/noImplicitAnyLet: Any is used here because the type of `values` is unknown
    let avatarResult;
    if (avatar) {
      avatarResult = await uploadAvatar(avatar, userId);
      if (oldAvatarKey) {
        await deleteAvatar(oldAvatarKey);
      }
    }

    const streamClient = getStreamClient();
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: values.displayName,
        bio: values.bio,
        ...(avatarResult && {
          avatarUrl: avatarResult.url,
          avatarKey: avatarResult.key
        })
      }
    });

    if (avatarResult) {
      await streamClient.partialUpdateUser({
        id: userId,
        set: {
          image: avatarResult.url
        }
      });
    }

    return NextResponse.json({
      user: updatedUser,
      avatar: avatarResult
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
