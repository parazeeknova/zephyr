import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prisma } from "@zephyr/db";
import { Discord, GitHub, Google, Twitter } from "arctic";
import { Lucia, type Session, type User } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production"
    }
  },
  getUserAttributes(databaseUserAttributes) {
    return {
      id: databaseUserAttributes.id,
      username: databaseUserAttributes.username,
      displayName: databaseUserAttributes.displayName,
      avatarUrl: databaseUserAttributes.avatarUrl,
      googleId: databaseUserAttributes.googleId
    };
  }
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  googleId: string | null;
}

export const google = new Google(
  // biome-ignore lint/style/noNonNullAssertion: Required for auth
  process.env.GOOGLE_CLIENT_ID!,
  // biome-ignore lint/style/noNonNullAssertion: Required for auth
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/google`
);

export const github = new GitHub(
  // biome-ignore lint/style/noNonNullAssertion: Required for auth
  process.env.GITHUB_CLIENT_ID!,
  // biome-ignore lint/style/noNonNullAssertion: Required for auth
  process.env.GITHUB_CLIENT_SECRET!,
  `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/github`
);

export const discord = new Discord(
  // biome-ignore lint/style/noNonNullAssertion: Required for auth
  process.env.DISCORD_CLIENT_ID!,
  // biome-ignore lint/style/noNonNullAssertion: Required for auth
  process.env.DISCORD_CLIENT_SECRET!,
  `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/discord`
);

export const twitter = new Twitter(
  // biome-ignore lint/style/noNonNullAssertion: Required for auth
  process.env.TWITTER_CLIENT_ID!,
  // biome-ignore lint/style/noNonNullAssertion: Required for auth
  process.env.TWITTER_CLIENT_SECRET!,
  `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/twitter`
);

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId =
      (await cookies()).get(lucia.sessionCookieName)?.value ?? null;

    if (!sessionId) {
      return {
        user: null,
        session: null
      };
    }

    const result = await lucia.validateSession(sessionId);

    try {
      if (result.session?.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch {}

    return result;
  }
);
