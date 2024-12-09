import { lucia } from "@zephyr/auth/auth";
import { getStreamClient } from "@zephyr/auth/src";
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
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET not configured");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        userId: string;
        email: string;
      };

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

      await prisma.$transaction([
        prisma.user.update({
          where: { id: decoded.userId },
          data: { emailVerified: true }
        }),
        prisma.emailVerificationToken.delete({
          where: { id: verificationToken.id }
        })
      ]);

      try {
        const streamClient = getStreamClient();
        if (streamClient) {
          await streamClient.upsertUser({
            id: user.id,
            name: user.displayName,
            username: user.username
          });
        }
      } catch (streamError) {
        console.error("Failed to create Stream user:", streamError);
      }

      const session = await lucia.createSession(decoded.userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
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
