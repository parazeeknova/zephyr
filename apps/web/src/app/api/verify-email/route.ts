import { getStreamClient } from "@/lib/stream";
import { lucia } from "@zephyr/auth/auth";
import { prisma } from "@zephyr/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return Response.redirect(
        new URL("/verify-email?error=invalid-token", req.url)
      );
    }

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verificationToken) {
      return Response.redirect(
        new URL("/verify-email?error=invalid-token", req.url)
      );
    }

    if (verificationToken.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id }
      });
      return Response.redirect(
        new URL("/verify-email?error=token-expired", req.url)
      );
    }

    try {
      // Verify the token
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
      };

      // Get user data for Stream Chat
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          displayName: true
        }
      });

      if (!user) {
        return Response.redirect(
          new URL("/verify-email?error=user-not-found", req.url)
        );
      }

      const streamClient = getStreamClient();

      // Update user, cleanup, and create Stream Chat user in a transaction
      await prisma.$transaction(async (tx) => {
        // Update user verification status
        await tx.user.update({
          where: { id: decoded.userId },
          data: { emailVerified: true }
        });

        // Delete verification token
        await tx.emailVerificationToken.delete({
          where: { id: verificationToken.id }
        });

        // Create Stream Chat user
        await streamClient.upsertUser({
          id: user.id,
          name: user.displayName,
          username: user.username
        });
      });

      // Create session
      const session = await lucia.createSession(decoded.userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);

      // Set cookie
      const cookieStore = await cookies();
      cookieStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );

      return Response.redirect(new URL("/?verified=true", req.url));
    } catch (error) {
      console.error("Token verification error:", error);
      return Response.redirect(
        new URL("/verify-email?error=verification-failed", req.url)
      );
    }
  } catch (error) {
    console.error("Verification error:", error);
    return Response.redirect(
      new URL("/verify-email?error=server-error", req.url)
    );
  }
}
