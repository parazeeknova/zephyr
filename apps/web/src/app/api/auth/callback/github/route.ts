import { slugify } from '@/lib/utils';
import { github, lucia, validateRequest } from '@zephyr/auth/auth';
import { createStreamUser } from '@zephyr/auth/src';
import { prisma } from '@zephyr/db';
import { OAuth2RequestError } from 'arctic';
import { generateIdFromEntropySize } from 'lucia';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');
    const storedState = (await cookies()).get('state')?.value;
    const isLinking = (await cookies()).get('linking')?.value === 'true';

    if (!code || !state || !storedState || state !== storedState) {
      return new Response(null, { status: 400 });
    }

    try {
      const tokens = await github.validateAuthorizationCode(code);
      // @ts-expect-error
      const accessToken = tokens.data.access_token;

      const githubUserResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!githubUserResponse.ok) {
        throw new Error(
          `Failed to fetch GitHub user: ${await githubUserResponse.text()}`
        );
      }

      const githubUser = await githubUserResponse.json();

      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!emailsResponse.ok) {
        throw new Error(
          `Failed to fetch GitHub emails: ${await emailsResponse.text()}`
        );
      }

      const emails = await emailsResponse.json();
      const primaryEmail = emails.find((email: any) => email.primary)?.email;

      if (!primaryEmail) {
        throw new Error('No primary email found');
      }

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

        const existingGithubUser = await prisma.user.findUnique({
          where: {
            githubId: githubUser.id.toString(),
          },
        });

        if (existingGithubUser && existingGithubUser.id !== user.id) {
          return new Response(null, {
            status: 302,
            headers: {
              Location: '/settings?error=github_account_linked_other',
            },
          });
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { githubId: githubUser.id.toString() },
        });

        (await cookies()).set('linking', '', { maxAge: 0 });

        return new Response(null, {
          status: 302,
          headers: {
            Location: '/settings?success=github_linked',
          },
        });
      }

      const existingUserWithEmail = await prisma.user.findUnique({
        where: {
          email: primaryEmail,
        },
      });

      if (existingUserWithEmail && !existingUserWithEmail.githubId) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: `/login/error?error=email_exists&email=${encodeURIComponent(githubUser.email)}`,
          },
        });
      }

      const existingGithubUser = await prisma.user.findUnique({
        where: {
          githubId: githubUser.id.toString(),
        },
      });

      if (existingGithubUser) {
        // @ts-expect-error
        const session = await lucia.createSession(existingGithubUser.id, {});
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
      const username = `${slugify(githubUser.login)}-${userId.slice(0, 4)}`;

      try {
        const newUser = await prisma.user.create({
          data: {
            id: userId,
            username,
            displayName: githubUser.name || githubUser.login,
            githubId: githubUser.id.toString(),
            email: primaryEmail,
            avatarUrl: githubUser.avatar_url,
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
        console.error('Transaction error:', error);
        throw error;
      }
    } catch (error) {
      console.error('GitHub API error:', error);
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
