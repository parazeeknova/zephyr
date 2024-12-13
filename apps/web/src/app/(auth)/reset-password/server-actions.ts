"use server";

import { hash } from "@node-rs/argon2";
import { sendPasswordResetEmail } from "@zephyr/auth/src";
import { prisma } from "@zephyr/db";
import jwt from "jsonwebtoken";
import { z } from "zod";

const requestResetSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must include: uppercase & lowercase letters, number, and special character"
    )
});

export async function requestPasswordReset(
  data: z.infer<typeof requestResetSchema>
) {
  try {
    const { email } = requestResetSchema.parse(data);

    const user = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" }
      }
    });

    if (!user) {
      return { success: true };
    }
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    // biome-ignore lint/style/noNonNullAssertion: This is safe because we check for the presence of the secret in the .env file
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h"
    });

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 3600000) // 1 hour
      }
    });

    await sendPasswordResetEmail(email, token);

    return { success: true };
  } catch (error) {
    console.error("Password reset request error:", error);
    return { error: "Failed to process password reset request" };
  }
}

export async function resetPassword(data: z.infer<typeof resetPasswordSchema>) {
  try {
    const { token, password } = resetPasswordSchema.parse(data);
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return { error: "Invalid or expired reset token" };
    }

    const passwordHash = await hash(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash }
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      })
    ]);

    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "Failed to reset password" };
  }
}
