import { slugify } from "@/lib/utils";
import { discord, lucia, validateRequest } from "@zephyr/auth/auth";
import { getStreamClient } from "@zephyr/auth/src";
import { prisma } from "@zephyr/db";
import { OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const storedState = (await cookies()).get("state")?.value;
    const isLinking = (await cookies()).get("linking")?.value === "true";

    if (!code || !state || !storedState || state !== storedState) {
      return new Response(null, { status: 400 });
    }

    try {
      // @ts-expect-error - Skip for now will fix in the next commit
      const tokens = await discord.validateAuthorizationCode(code);
      // @ts-ignore
      const accessToken = tokens.data?.access_token;

      if (!accessToken) {
        console.error("No access token found in response:", tokens);
        throw new Error("No access token received from Discord");
      }

      console.log("Discord access token:", accessToken);

      const discordUserResponse = await fetch(
        "https://discord.com/api/v10/users/@me",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const responseText = await discordUserResponse.text();
      if (!discordUserResponse.ok) {
        throw new Error(`Failed to fetch Discord user: ${responseText}`);
      }

      const discordUser = JSON.parse(responseText);
      if (!discordUser.email) {
        throw new Error("No email provided by Discord");
      }

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

        const existingDiscordUser = await prisma.user.findUnique({
          where: {
            discordId: discordUser.id
          }
        });

        if (existingDiscordUser && existingDiscordUser.id !== user.id) {
          return new Response(null, {
            status: 302,
            headers: {
              Location: "/settings?error=discord_account_linked_other"
            }
          });
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { discordId: discordUser.id }
        });

        (await cookies()).set("linking", "", { maxAge: 0 });

        return new Response(null, {
          status: 302,
          headers: {
            Location: "/settings?success=discord_linked"
          }
        });
      }

      const existingUserWithEmail = await prisma.user.findUnique({
        where: {
          email: discordUser.email
        }
      });

      if (existingUserWithEmail && !existingUserWithEmail.discordId) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: `/login/error?error=email_exists&email=${encodeURIComponent(discordUser.email)}`
          }
        });
      }

      const existingDiscordUser = await prisma.user.findUnique({
        where: {
          discordId: discordUser.id
        }
      });

      if (existingDiscordUser) {
        // @ts-expect-error
        const session = await lucia.createSession(existingDiscordUser.id, {});
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
      const username = `${slugify(discordUser.username)}-${userId.slice(0, 4)}`;

      try {
        await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              id: userId,
              username,
              displayName: discordUser.global_name || discordUser.username,
              discordId: discordUser.id,
              email: discordUser.email,
              avatarUrl: discordUser.avatar
                ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
                : null,
              emailVerified: true
            }
          });

          const streamClient = getStreamClient();
          if (streamClient) {
            try {
              await streamClient.upsertUser({
                id: newUser.id,
                username: newUser.username,
                name: newUser.displayName
              });
            } catch (error) {
              console.warn("Failed to create Stream user:", error);
            }
          }
        });

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
        console.error("Transaction error:", error);
        throw error;
      }
    } catch (error) {
      console.error("Discord API error:", error);
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
