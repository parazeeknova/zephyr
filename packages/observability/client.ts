import { init } from '@sentry/nextjs';
import * as Sentry from '@sentry/nextjs';
import { keys } from './keys';

export const initializeSentry = (): ReturnType<typeof init> =>
  init({
    dsn: keys().NEXT_PUBLIC_SENTRY_DSN,
    // Add optional integrations for additional features
    integrations: [Sentry.replayIntegration()],
    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    debug: false,
    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,
    // Define how likely Replay events are sampled.
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,
  });
