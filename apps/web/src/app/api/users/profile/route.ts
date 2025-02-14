import { deleteAvatar, uploadAvatar } from '@/lib/minio';
import { getStreamClient } from '@zephyr/auth/src';
import { prisma } from '@zephyr/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const values = JSON.parse(formData.get('values') as string);
    const avatar = formData.get('avatar') as File;
    const userId = formData.get('userId') as string;
    const oldAvatarKey = formData.get('oldAvatarKey') as string;

    // biome-ignore lint/suspicious/noImplicitAnyLet: need to use let here
    let avatarResult;
    if (avatar) {
      avatarResult = await uploadAvatar(avatar, userId);
      if (oldAvatarKey) {
        await deleteAvatar(oldAvatarKey);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: values.displayName,
        bio: values.bio,
        ...(avatarResult && {
          avatarUrl: avatarResult.url,
          avatarKey: avatarResult.key,
        }),
      },
    });

    try {
      const streamClient = getStreamClient();
      if (streamClient && avatarResult) {
        await streamClient.partialUpdateUser({
          id: userId,
          set: {
            image: avatarResult.url,
            name: values.displayName,
          },
        });
      }
    } catch (streamError) {
      console.error('Failed to update Stream user profile:', streamError);
    }

    return NextResponse.json({
      user: updatedUser,
      avatar: avatarResult,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
