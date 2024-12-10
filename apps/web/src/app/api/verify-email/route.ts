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
  JWT_SECRET_MISSING: "jwt-secret-missing"
} as const;

type ErrorType = (typeof ERROR_TYPES)[keyof typeof ERROR_TYPES];

const createErrorRedirect = (origin: string, errorType: ErrorType) => {
  return Response.redirect(`${origin}/verify-email?error=${errorType}`);
};

const createSuccessRedirect = (origin: string) => {
  return Response.redirect(`${origin}/?verified=true`);
};

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  console.log("Verification request from origin:", origin);

  try {
    // 1. Token Validation
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      console.log("No token provided in request");
      return createErrorRedirect(origin, ERROR_TYPES.INVALID_TOKEN);
    }

    // 2. Fetch Verification Token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verificationToken) {
      console.log("Token not found in database");
      return createErrorRedirect(origin, ERROR_TYPES.INVALID_TOKEN);
    }

    // 3. Check Token Expiration
    if (verificationToken.expiresAt < new Date()) {
      console.log("Token has expired");
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id }
      });
      return createErrorRedirect(origin, ERROR_TYPES.TOKEN_EXPIRED);
    }

    // 4. JWT Verification
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET environment variable not configured");
      return createErrorRedirect(origin, ERROR_TYPES.JWT_SECRET_MISSING);
    }

    try {
      // 5. Decode and Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        userId: string;
        email: string;
        timestamp: number;
      };

      // 6. Fetch User
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
        console.log("User not found:", decoded.userId);
        return createErrorRedirect(origin, ERROR_TYPES.USER_NOT_FOUND);
      }

      // 7. Check if already verified
      if (user.emailVerified) {
        console.log("Email already verified for user:", user.id);
        return createSuccessRedirect(origin);
      }

      // 8. Transaction: Update User and Clean Up Token
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: decoded.userId },
          data: { emailVerified: true }
        });

        await tx.emailVerificationToken.delete({
          where: { id: verificationToken.id }
        });
      });

      // 9. Create Stream User
      try {
        const streamClient = getStreamClient();
        if (streamClient) {
          await streamClient.upsertUser({
            id: user.id,
            name: user.displayName,
            username: user.username
          });
          console.log("Stream user created successfully for:", user.id);
        }
      } catch (streamError) {
        console.error("Failed to create Stream user:", streamError);
      }

      // 10. Create Session
      const session = await lucia.createSession(decoded.userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      const cookieStore = await cookies();
      cookieStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );

      console.log("Email verification successful for user:", user.id);
      return createSuccessRedirect(origin);
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return createErrorRedirect(origin, ERROR_TYPES.VERIFICATION_FAILED);
    }
  } catch (error) {
    console.error("Verification process failed:", error);
    return createErrorRedirect(origin, ERROR_TYPES.SERVER_ERROR);
  }
}
