"use server";

import { verify } from "@node-rs/argon2";
import { lucia } from "@zephyr/auth/auth";
import { sendVerificationEmail } from "@zephyr/auth/src/email/service";
import { type LoginValues, loginSchema } from "@zephyr/auth/validation";
import { prisma } from "@zephyr/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function createVerificationTokenForUser(
  userId: string,
  email: string
) {
  const existingToken = await prisma.emailVerificationToken.findFirst({
    where: { userId }
  });

  if (existingToken) {
    const newToken = jwt.sign(
      { userId, email },
      // biome-ignore lint/style/noNonNullAssertion: JWT_SECRET is required
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    await prisma.emailVerificationToken.update({
      where: { id: existingToken.id },
      data: {
        token: newToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000)
      }
    });

    return newToken;
  }

  const token = jwt.sign(
    { userId, email },
    // biome-ignore lint/style/noNonNullAssertion: JWT_SECRET is required
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  await prisma.emailVerificationToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 3600000)
    }
  });

  return token;
}

export async function loginAction(credentials: LoginValues): Promise<{
  error?: string;
  success?: boolean;
  emailVerification?: {
    email: string;
    isNewToken: boolean;
  };
}> {
  try {
    const { username, password } = loginSchema.parse(credentials);

    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive"
        }
      }
    });

    if (!existingUser || !existingUser.passwordHash) {
      return { error: "Incorrect username or password", success: false };
    }

    const validPassword = await verify(existingUser.passwordHash, password);

    if (!validPassword) {
      return { error: "Incorrect username or password", success: false };
    }

    if (!existingUser.emailVerified && !existingUser.googleId) {
      if (!existingUser.email) {
        return { error: "Account has no associated email", success: false };
      }

      try {
        const token = await createVerificationTokenForUser(
          existingUser.id,
          existingUser.email
        );
        await sendVerificationEmail(existingUser.email, token);

        return {
          success: false,
          emailVerification: {
            email: existingUser.email,
            isNewToken: true
          }
        };
      } catch (_error) {
        return { error: "Failed to create verification token", success: false };
      }
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    const cookieStore = await cookies();
    cookieStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong. Please try again.", success: false };
  }
}
