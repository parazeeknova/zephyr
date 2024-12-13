import { lucia } from "@zephyr/auth/auth";
import { getStreamClient } from "@zephyr/auth/src";
import { prisma } from "@zephyr/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const ERROR_TYPES = {
  INVALID_TOKEN: "invalid-token",
  TOKEN_EXPIRED: "token-expired",
  USER_NOT_FOUND: "user-not-found",
  VERIFICATION_FAILED: "verification-failed",
  SERVER_ERROR: "server-error",
  JWT_SECRET_MISSING: "jwt-secret-missing",
  CONFIG_ERROR: "configuration-error"
} as const;

type ErrorType = (typeof ERROR_TYPES)[keyof typeof ERROR_TYPES];

interface JWTPayload {
  userId: string;
  email: string;
  timestamp: number;
}

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  console.error("NEXT_PUBLIC_SITE_URL not configured in production");
  throw new Error("Missing NEXT_PUBLIC_SITE_URL configuration");
};

const createErrorRedirect = (errorType: ErrorType) => {
  const baseUrl = getBaseUrl();
  console.log(
    `Creating error redirect to: ${baseUrl}/verify-email?error=${errorType}`
  );
  return Response.redirect(`${baseUrl}/verify-email?error=${errorType}`);
};

const createSuccessRedirect = () => {
  const baseUrl = getBaseUrl();
  console.log(`Creating success redirect to: ${baseUrl}/?verified=true`);
  return Response.redirect(`${baseUrl}/?verified=true`);
};

export async function GET(req: NextRequest) {
  console.log("Starting email verification process");

  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not configured");
      return createErrorRedirect(ERROR_TYPES.JWT_SECRET_MISSING);
    }

    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      console.log("No verification token provided");
      return createErrorRedirect(ERROR_TYPES.INVALID_TOKEN);
    }

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verificationToken) {
      console.log("Verification token not found in database");
      return createErrorRedirect(ERROR_TYPES.INVALID_TOKEN);
    }

    if (verificationToken.expiresAt < new Date()) {
      console.log("Verification token has expired");
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id }
      });
      return createErrorRedirect(ERROR_TYPES.TOKEN_EXPIRED);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          displayName: true,
          emailVerified: true
        }
      });

      if (!user) {
        console.log(`User not found: ${decoded.userId}`);
        return createErrorRedirect(ERROR_TYPES.USER_NOT_FOUND);
      }

      if (user.emailVerified) {
        console.log(`Email already verified for user: ${user.id}`);
        return createSuccessRedirect();
      }

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: decoded.userId },
          data: { emailVerified: true }
        });

        await tx.emailVerificationToken.delete({
          where: { id: verificationToken.id }
        });
      });

      try {
        const streamClient = getStreamClient();
        if (streamClient) {
          await streamClient.upsertUser({
            id: user.id,
            name: user.displayName,
            username: user.username
          });
          console.log(`Stream user created for: ${user.id}`);
        }
      } catch (streamError) {
        console.error("Stream user creation failed:", streamError);
      }

      const session = await lucia.createSession(decoded.userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      const cookieStore = await cookies();
      cookieStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );

      console.log(`Email verification successful for user: ${user.id}`);
      return createSuccessRedirect();
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return createErrorRedirect(ERROR_TYPES.VERIFICATION_FAILED);
    }
  } catch (error) {
    console.error("Verification process failed:", error);
    return createErrorRedirect(ERROR_TYPES.SERVER_ERROR);
  }
}
