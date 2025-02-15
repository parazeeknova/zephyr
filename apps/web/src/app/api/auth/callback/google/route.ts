import { slugify } from '@/lib/utils';
import { google, lucia, validateRequest } from '@zephyr/auth/auth';
import { createStreamUser } from '@zephyr/auth/src';
import { prisma } from '@zephyr/db';
import { OAuth2RequestError } from 'arctic';
import { generateIdFromEntropySize } from 'lucia';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex logic is required here
export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');
    const storedState = (await cookies()).get('state')?.value;
    const storedCodeVerifier = (await cookies()).get('code_verifier')?.value;
    const isLinking = (await cookies()).get('linking')?.value === 'true';

    if (
      !code ||
      !state ||
      !storedState ||
      !storedCodeVerifier ||
      state !== storedState
    ) {
      return new Response(null, { status: 400 });
    }

    // biome-ignore lint/suspicious/noImplicitAnyLet: this is a third-party library
    // biome-ignore lint/suspicious/noEvolvingTypes: this is a third-party library
    let tokenResponse;
    try {
      tokenResponse = await google.validateAuthorizationCode(
        code,
        storedCodeVerifier
      );
    } catch (error) {
      console.error('Token validation error:', error);
      throw error;
    }

    // @ts-expect-error
    const accessToken = tokenResponse?.data?.access_token;
    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('Invalid access token structure');
    }

    const response = await fetch(
      'https://www.googleapis.com/oauth2/v1/userinfo',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API error: ${response.status} - ${errorText}`);
    }

    const googleUser = await response.json();

    if (isLinking) {
      const { user } = await validateRequest();
      if (!user) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: '/login',
          },
        });
      }

      const existingGoogleUser = await prisma.user.findUnique({
        where: {
          googleId: googleUser.id,
        },
      });

      if (existingGoogleUser && existingGoogleUser.id !== user.id) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: '/settings?error=google_account_linked',
          },
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.id },
      });

      (await cookies()).set('linking', '', { maxAge: 0 });

      return new Response(null, {
        status: 302,
        headers: {
          Location: '/settings?success=google_linked',
        },
      });
    }

    const existingUserWithEmail = await prisma.user.findUnique({
      where: {
        email: googleUser.email,
      },
    });

    if (existingUserWithEmail && !existingUserWithEmail.googleId) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/login/error?error=email_exists&email=${encodeURIComponent(googleUser.email)}`,
        },
      });
    }

    const existingGoogleUser = await prisma.user.findUnique({
      where: {
        googleId: googleUser.id,
      },
    });

    if (existingGoogleUser) {
      // @ts-expect-error
      const session = await lucia.createSession(existingGoogleUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/',
        },
      });
    }

    const userId = generateIdFromEntropySize(10);
    const username = `${slugify(googleUser.name)}-${userId.slice(0, 4)}`;

    try {
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          username,
          displayName: googleUser.name,
          googleId: googleUser.id,
          email: googleUser.email,
          avatarUrl: googleUser.picture,
          emailVerified: true,
        },
      });

      try {
        await createStreamUser(
          newUser.id,
          newUser.username,
          newUser.displayName
        );
      } catch (streamError) {
        console.error('Failed to create Stream user:', streamError);
      }

      // @ts-expect-error
      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );

      return new Response(null, {
        status: 302,
        headers: {
          Location: '/',
        },
      });
    } catch (error) {
      console.error('User creation error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Final error catch:', error);
    if (error instanceof OAuth2RequestError) {
      return new Response(null, { status: 400 });
    }
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
