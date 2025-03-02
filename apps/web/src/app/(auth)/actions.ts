'use server';

import { lucia, validateRequest } from '@zephyr/auth/auth';
import { cookies } from 'next/headers';

export async function logout() {
  try {
    const { session } = await validateRequest();
    if (session) {
      await lucia.invalidateSession(session.id);
    }

    const cookieStore = await cookies();
    const sessionCookie = lucia.createBlankSessionCookie();

    cookieStore.set(sessionCookie.name, sessionCookie.value, {
      ...sessionCookie.attributes,
      path: '/',
    });

    return { redirect: '/login' };
  } catch (error) {
    console.error('Session invalidation error:', error);
    return { error: 'Logout failed' };
  }
}
