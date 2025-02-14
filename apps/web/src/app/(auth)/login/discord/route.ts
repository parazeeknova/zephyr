import { discord } from '@zephyr/auth/auth';
import { generateState } from 'arctic';
import { cookies } from 'next/headers';

export async function GET() {
  const state = generateState();

  (await cookies()).set('state', state, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  });

  const url = await discord.createAuthorizationURL(state, [
    'identify',
    'email',
  ]);

  return Response.redirect(url.toString());
}
