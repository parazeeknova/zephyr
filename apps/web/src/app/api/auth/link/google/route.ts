import { google, validateRequest } from "@zephyr/auth/auth";
import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";

export async function GET() {
  // Check if user is authenticated
  const { user } = await validateRequest();
  if (!user) {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    return Response.redirect(new URL("/login", process.env.NEXT_PUBLIC_URL!));
  }

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const cookieStore = await cookies();

  // Set OAuth cookies
  cookieStore.set("state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax"
  });

  cookieStore.set("code_verifier", codeVerifier, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
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
  const url = await google.createAuthorizationURL(state, codeVerifier, [
    "email",
    "profile",
    "openid"
  ]);

  return Response.redirect(url);
}
