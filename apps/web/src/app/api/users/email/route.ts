import { createVerificationTokenForUser } from "@/app/(auth)/login/server-actions";
import { sendVerificationEmail } from "@/lib/nodemailer";
import { validateRequest } from "@zephyr/auth/auth";
import { prisma } from "@zephyr/db";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

export async function PATCH(request: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email } = emailSchema.parse(body);

    // Check if email is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" },
        id: { not: user.id }
      }
    });

    if (existingUser) {
      return Response.json(
        { error: "Email is already taken" },
        { status: 400 }
      );
    }

    // Update email and set emailVerified to false
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        emailVerified: false
      }
    });

    // Create and send verification token
    const token = await createVerificationTokenForUser(user.id, email);
    await sendVerificationEmail(email, token);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to update email:", error);
    return Response.json({ error: "Failed to update email" }, { status: 500 });
  }
}
