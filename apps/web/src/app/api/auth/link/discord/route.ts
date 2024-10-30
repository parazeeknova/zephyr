import { discord, validateRequest } from "@zephyr/auth/auth";
import { generateState } from "arctic";
import { cookies } from "next/headers";

export async function GET() {
  // Check if user is authenticated
  const { user } = await validateRequest();
  if (!user) {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    return Response.redirect(new URL("/login", process.env.NEXT_PUBLIC_URL!));
  }

  const state = generateState();
  const cookieStore = await cookies();

  // Set OAuth cookies
  cookieStore.set("state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax"
  });

  // Set linking flag
  cookieStore.set("linking", "true", {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax"
  });

  // Create authorization URL with required scopes
  const url = await discord.createAuthorizationURL(state, [
    "identify",
    "email"
  ]);

  return Response.redirect(url);
}
