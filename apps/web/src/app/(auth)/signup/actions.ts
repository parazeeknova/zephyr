"use server";

import { hash } from "@node-rs/argon2";
import { createStreamUser } from "@zephyr/auth/src";
import { sendVerificationEmail } from "@zephyr/auth/src/email/service";
import { EMAIL_ERRORS, isEmailValid } from "@zephyr/auth/src/email/validation";
import { resendVerificationEmail } from "@zephyr/auth/src/verification/resend";
import { type SignUpValues, signUpSchema } from "@zephyr/auth/validation";
import { prisma } from "@zephyr/db";
import jwt from "jsonwebtoken";
import { generateIdFromEntropySize } from "lucia";

const USERNAME_ERRORS = {
  TAKEN: "This username is already taken. Please choose another.",
  INVALID: "Username can only contain letters, numbers, and underscores.",
  REQUIRED: "Username is required"
};

const SYSTEM_ERRORS = {
  JWT_SECRET: "System configuration error: JWT_SECRET is not configured",
  USER_ID: "Failed to generate user ID",
  TOKEN: "Failed to generate verification token",
  INVALID_PAYLOAD: "Invalid token payload data"
};

if (!process.env.JWT_SECRET) {
  throw new Error(SYSTEM_ERRORS.JWT_SECRET);
}

export { resendVerificationEmail };

export async function signUp(
  credentials: SignUpValues
): Promise<{ error?: string; success?: boolean }> {
  try {
    if (!credentials) {
      return { error: "No credentials provided", success: false };
    }

    const validationResult = signUpSchema.safeParse(credentials);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return {
        error: firstError?.message || "Invalid credentials",
        success: false
      };
    }

    const { username, email, password } = validationResult.data;

    if (!username || !email || !password) {
      return { error: "All fields are required", success: false };
    }

    const emailValidation = await isEmailValid(email);
    if (!emailValidation.isValid) {
      return {
        error: emailValidation.error || EMAIL_ERRORS.VALIDATION_FAILED,
        success: false
      };
    }

    const existingUsername = await prisma.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } }
    });

    if (existingUsername) {
      return { error: USERNAME_ERRORS.TAKEN, success: false };
    }

    const existingEmail = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } }
    });

    if (existingEmail) {
      return { error: EMAIL_ERRORS.ALREADY_EXISTS, success: false };
    }

    const passwordHash = await hash(password);
    const userId = generateIdFromEntropySize(10);

    if (!userId) {
      throw new Error(SYSTEM_ERRORS.USER_ID);
    }

    const tokenPayload = { userId, email, timestamp: Date.now() };
    if (!process.env.JWT_SECRET) {
      throw new Error(SYSTEM_ERRORS.JWT_SECRET);
    }
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          id: userId,
          username,
          displayName: username,
          email,
          passwordHash,
          emailVerified: false
        }
      });

      await tx.emailVerificationToken.create({
        data: {
          token,
          userId,
          expiresAt: new Date(Date.now() + 3600000)
        }
      });

      await createStreamUser(newUser.id, newUser.username, newUser.displayName);
    });

    await sendVerificationEmail(email, token);

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      success: false
    };
  }
}
