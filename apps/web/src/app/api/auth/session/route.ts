import {
  createBlankSessionCookie,
  createSessionCookie,
} from '@zephyr/auth/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { sessionId } = await request.json();

  if (sessionId) {
    const sessionCookie = createSessionCookie(sessionId);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  } else {
    const blankCookie = createBlankSessionCookie();
    (await cookies()).set(
      blankCookie.name,
      blankCookie.value,
      blankCookie.attributes
    );
  }

  return NextResponse.json({ success: true });
}
