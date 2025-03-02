import { avatarCache, prisma } from '@zephyr/db';
import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type RouteContext = {
  params: { userId: string };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const userId = params.userId;

    const cachedAvatar = await avatarCache.get(userId);

    if (cachedAvatar) {
      const secureUrl =
        process.env.NODE_ENV === 'production'
          ? cachedAvatar.url.replace('http://', 'https://')
          : cachedAvatar.url;

      return NextResponse.json({
        ...cachedAvatar,
        url: secureUrl,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        avatarUrl: true,
        avatarKey: true,
      },
    });

    if (!user?.avatarUrl) {
      return NextResponse.json({ error: 'Avatar not found' }, { status: 404 });
    }

    const secureUrl =
      process.env.NODE_ENV === 'production'
        ? user.avatarUrl.replace('http://', 'https://')
        : user.avatarUrl;

    const avatarData = {
      url: secureUrl,
      // biome-ignore lint/style/noNonNullAssertion: This is safe because we check for the value above
      key: user.avatarKey!,
      updatedAt: new Date().toISOString(),
    };

    await avatarCache.set(userId, avatarData);

    return NextResponse.json(avatarData);
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
