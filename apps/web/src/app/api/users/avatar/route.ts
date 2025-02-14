import { deleteAvatar, uploadAvatar } from '@/lib/minio'; // Add deleteAvatar import
import { getStreamClient } from '@zephyr/auth/src';
import { prisma } from '@zephyr/db';
import { avatarCache } from '@zephyr/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const oldAvatarKey = formData.get('oldAvatarKey') as string;

    if (!file || !userId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    console.log('Avatar update started:', {
      userId,
      oldAvatarKey: oldAvatarKey || 'none',
      newFile: {
        name: file.name,
        type: file.type,
        size: file.size,
      },
    });

    const result = await uploadAvatar(file, userId);

    const avatarUrl =
      process.env.NODE_ENV === 'production'
        ? result.url.replace('http://', 'https://')
        : result.url;

    if (oldAvatarKey) {
      try {
        await deleteAvatar(oldAvatarKey);
        console.log('Old avatar deleted successfully:', oldAvatarKey);
      } catch (deleteError) {
        console.error('Failed to delete old avatar:', deleteError);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: avatarUrl,
        avatarKey: result.key,
      },
    });

    await avatarCache.set(userId, {
      url: avatarUrl,
      key: result.key,
      updatedAt: new Date().toISOString(),
    });

    try {
      const streamClient = getStreamClient();
      if (streamClient) {
        await streamClient.partialUpdateUser({
          id: userId,
          set: {
            image: avatarUrl,
          },
        });
        console.log('Stream user avatar updated successfully');
      }
    } catch (streamError) {
      console.error('Failed to update Stream user avatar:', streamError);
    }

    console.log('Avatar update completed successfully:', {
      userId,
      newAvatarKey: result.key,
    });

    return NextResponse.json({
      user: updatedUser,
      avatar: { ...result, url: avatarUrl },
    });
  } catch (error) {
    console.error('Avatar update error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to update avatar',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { avatarKey, userId } = await request.json();

    if (!avatarKey || !userId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }
    await deleteAvatar(avatarKey);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: null,
        avatarKey: null,
      },
    });

    await avatarCache.del(userId);

    try {
      const streamClient = getStreamClient();
      if (streamClient) {
        await streamClient.partialUpdateUser({
          id: userId,
          set: {
            image: null,
          },
        });
      }
    } catch (streamError) {
      console.error('Failed to update Stream user avatar:', streamError);
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Avatar deletion error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to delete avatar',
      },
      { status: 500 }
    );
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
        avatarKey: true,
      },
    });

    if (!user?.avatarUrl) {
      return new NextResponse('Avatar not found', { status: 404 });
    }

    await avatarCache.set(userId, {
      url: user.avatarUrl,
      // biome-ignore lint/style/noNonNullAssertion: We know `user.avatarKey` is defined
      key: user.avatarKey!,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      url: user.avatarUrl,
      key: user.avatarKey,
    });
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch avatar',
      },
      { status: 500 }
    );
  }
}
