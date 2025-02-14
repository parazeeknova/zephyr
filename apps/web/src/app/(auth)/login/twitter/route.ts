import { twitter } from '@zephyr/auth/auth';
import { generateCodeVerifier, generateState } from 'arctic';
import { cookies } from 'next/headers';

export async function GET() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  (await cookies()).set('state', state, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  });

  (await cookies()).set('code_verifier', codeVerifier, {
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

  return Response.redirect(url.toString());
}
