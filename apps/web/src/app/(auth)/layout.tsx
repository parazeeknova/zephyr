import { validateRequest } from '@zephyr/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type React from 'react';

async function getBaseUrl() {
  const host = (await headers()).get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

async function updateSessionCookie(sessionId: string | null) {
  const baseUrl = await getBaseUrl();
  await fetch(`${baseUrl}/api/auth/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId }),
  });
}

export default async function Layout({
  children,
}: { children: React.ReactNode }) {
  const result = await validateRequest();

  if (result.session?.fresh) {
    await updateSessionCookie(result.session.id);
  }
  if (!result.session) {
    await updateSessionCookie(null);
  }

  if (result.user) {
    redirect('/');
  }

  return (
    <>
      <div className="font-sofiaProSoftMed">{children}</div>
    </>
  );
}
