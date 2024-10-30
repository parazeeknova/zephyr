import { streamServerClient } from "@/lib/stream";
import { slugify } from "@/lib/utils";
import { google, lucia, validateRequest } from "@zephyr/auth/auth";
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

    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let tokenResponse;
    try {
      tokenResponse = await google.validateAuthorizationCode(
        code,
        storedCodeVerifier
      );
    } catch (error) {
      console.error("Token validation error:", error);
      throw error;
    }

    // @ts-expect-error Property 'access_token' does not exist on type 'object'.ts(2339)
    const accessToken = tokenResponse?.data?.access_token;
    if (!accessToken || typeof accessToken !== "string") {
      throw new Error("Invalid access token structure");
    }

    const response = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json"
        }
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
            Location: "/login"
          }
        });
      }

      const existingGoogleUser = await prisma.user.findUnique({
        where: {
          googleId: googleUser.id
        }
      });

      if (existingGoogleUser && existingGoogleUser.id !== user.id) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/settings?error=google_account_linked"
          }
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.id }
      });

      (await cookies()).set("linking", "", { maxAge: 0 });

      return new Response(null, {
        status: 302,
        headers: {
          Location: "/settings?success=google_linked"
        }
      });
    }

    // Check if user exists with email but without Google auth
    const existingUserWithEmail = await prisma.user.findUnique({
      where: {
        email: googleUser.email
      }
    });

    if (existingUserWithEmail && !existingUserWithEmail.googleId) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/login/error?error=email_exists&email=${encodeURIComponent(googleUser.email)}`
        }
      });
    }

    // Check for existing Google user
    const existingGoogleUser = await prisma.user.findUnique({
      where: {
        googleId: googleUser.id
      }
    });

    if (existingGoogleUser) {
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
          Location: "/"
        }
      });
    }

    // Create new user
    const userId = generateIdFromEntropySize(10);
    const username = `${slugify(googleUser.name)}-${userId.slice(0, 4)}`;

    try {
      await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            id: userId,
            username,
            displayName: googleUser.name,
            googleId: googleUser.id,
            email: googleUser.email,
            avatarUrl: googleUser.picture,
            emailVerified: true
          }
        });

        await streamServerClient.upsertUser({
          id: newUser.id,
          username: newUser.username,
          name: newUser.displayName
        });
      });

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
      console.error("Transaction error:", error);
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
