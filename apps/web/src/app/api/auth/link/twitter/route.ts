import { twitter, validateRequest } from '@zephyr/auth/auth';
import { generateCodeVerifier, generateState } from 'arctic';
import { cookies } from 'next/headers';

export async function GET() {
  const { user } = await validateRequest();
  if (!user) {
    // biome-ignore lint/style/noNonNullAssertion: This is a valid use case
    return Response.redirect(new URL('/login', process.env.NEXT_PUBLIC_URL!));
  }

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const cookieStore = await cookies();

  cookieStore.set('state', state, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  });

  cookieStore.set('code_verifier', codeVerifier, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  });

  cookieStore.set('linking', 'true', {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  });

  const url = await twitter.createAuthorizationURL(state, codeVerifier, [
    'tweet.read',
    'users.read',
  ]);

  return Response.redirect(url);
}
