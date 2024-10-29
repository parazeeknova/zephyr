import { prisma } from "@zephyr/db";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token || typeof token !== "string" || token.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Verify token exists and is valid
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      return new Response(JSON.stringify({ error: "Token not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (resetToken.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      });

      return new Response(JSON.stringify({ error: "Token expired" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ valid: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Reset token verification error:", error);
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}
