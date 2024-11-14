const REQUIRED_ENV_VARS = {
  NEXT_PUBLIC_STREAM_KEY: process.env.NEXT_PUBLIC_STREAM_KEY,
  STREAM_SECRET: process.env.STREAM_SECRET
} as const;

export function validateStreamEnv() {
  // Skip validation in these scenarios:
  // 1. During not-found page generation
  // 2. During static page generation
  // 3. When explicitly skipped
  if (
    process.env.NEXT_PRIVATE_SKIP_VALIDATION === "true" ||
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.VERCEL_ENV === "production"
  ) {
    return;
  }

  const missing = Object.entries(REQUIRED_ENV_VARS)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        `Warning: Missing Stream Chat environment variables: ${missing.join(", ")}`
      );
      return;
    }

    if (process.env.NODE_ENV === "development") {
      throw new Error(
        `Stream Chat environment variables are not configured. Missing: ${missing.join(
          ", "
        )}`
      );
    }

    console.warn(
      `Warning: Missing Stream Chat environment variables: ${missing.join(", ")}`
    );
  }
}

export function getStreamConfig() {
  if (process.env.NODE_ENV === "development") {
    validateStreamEnv();
  }

  return {
    apiKey: process.env.NEXT_PUBLIC_STREAM_KEY ?? "",
    secret: process.env.STREAM_SECRET ?? ""
  };
}

export function isStreamConfigured() {
  return !!(process.env.NEXT_PUBLIC_STREAM_KEY && process.env.STREAM_SECRET);
}
