'use server';

import { lucia, validateRequest } from '@zephyr/auth/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
  try {
    const { session } = await validateRequest();
    if (session) {
      await lucia.invalidateSession(session.id);
    }
    const sessionCookie = lucia.createBlankSessionCookie();
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  } catch (error) {
    console.error('Session invalidation error:', error);
  }

  redirect('/login');
}
