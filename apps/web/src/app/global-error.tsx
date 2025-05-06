'use client';
// biome-ignore lint/suspicious/noShadowRestrictedNames: This is a custom error component
import Error from './error';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <Error error={error} reset={reset} />
      </body>
    </html>
  );
}
