'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
// biome-ignore lint/suspicious/noShadowRestrictedNames: This is a custom error component
import Error from './error';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  });
  return (
    <html lang="en">
      <body>
        <Error error={error} reset={reset} />
      </body>
    </html>
  );
}
