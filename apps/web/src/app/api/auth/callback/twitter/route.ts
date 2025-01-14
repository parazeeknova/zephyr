import { slugify } from "@/lib/utils";
import { lucia, twitter, validateRequest } from "@zephyr/auth/auth";
import { createStreamUser } from "@zephyr/auth/src";
import { prisma } from "@zephyr/db";
import { OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const storedState = (await cookies()).get("state")?.value;
    const storedCodeVerifier = (await cookies()).get("code_verifier")?.value;
    const isLinking = (await cookies()).get("linking")?.value === "true";

    if (
      !code ||
      !state ||
      !storedState ||
      !storedCodeVerifier ||
      state !== storedState
    ) {
      return new Response(null, { status: 400 });
    }

    try {
      const tokens = await twitter.validateAuthorizationCode(
        code,
        storedCodeVerifier
      );
      // @ts-expect-error
      const accessToken = tokens.data.access_token;

      if (!accessToken) {
        throw new Error("No access token received from Twitter");
      }

      const userResponse = await fetch(
        "https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error("Twitter API Error Response:", errorText);
        throw new Error(`Failed to fetch Twitter user data: ${errorText}`);
      }

      const { data: twitterUser } = await userResponse.json();

      if (isLinking) {
        const { user } = await validateRequest();
        if (!user) {
          return new Response(null, {
            status: 302,
            headers: {
              Location: "/login"
            }
          });
        }

        const existingTwitterUser = await prisma.user.findUnique({
          where: {
            twitterId: twitterUser.id
          }
        });

        if (existingTwitterUser && existingTwitterUser.id !== user.id) {
          return new Response(null, {
            status: 302,
            headers: {
              Location: "/settings?error=twitter_account_linked_other"
            }
          });
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { twitterId: twitterUser.id }
        });

        (await cookies()).set("linking", "", { maxAge: 0 });

        return new Response(null, {
          status: 302,
          headers: {
            Location: "/settings?success=twitter_linked"
          }
        });
      }

      const existingTwitterUser = await prisma.user.findUnique({
        where: {
          twitterId: twitterUser.id
        }
      });

      if (existingTwitterUser) {
        // @ts-expect-error
        const session = await lucia.createSession(existingTwitterUser.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/"
          }
        });
      }

      const userId = generateIdFromEntropySize(10);
      const username = `${slugify(twitterUser.username)}-${userId.slice(0, 4)}`;

      try {
        const newUser = await prisma.user.create({
          data: {
            id: userId,
            username,
            displayName: twitterUser.name,
            twitterId: twitterUser.id,
            email: `${userId}@twitter.placeholder.com`,
            avatarUrl: twitterUser.profile_image_url,
            emailVerified: false
          }
        });

        try {
          await createStreamUser(
            newUser.id,
            newUser.username,
            newUser.displayName
          );
        } catch (streamError) {
          console.error("Failed to create Stream user:", streamError);
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
            Location: "/"
          }
        });
      } catch (error) {
        console.error("User creation error:", error);
        throw error;
      }
    } catch (error) {
      console.error("Twitter API error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Final error catch:", error);
    if (error instanceof OAuth2RequestError) {
      return new Response(null, { status: 400 });
    }
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}
