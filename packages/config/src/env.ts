const REQUIRED_ENV_VARS = {
  NEXT_PUBLIC_STREAM_KEY: process.env.NEXT_PUBLIC_STREAM_KEY,
  STREAM_SECRET: process.env.STREAM_SECRET
} as const;

export function validateStreamEnv() {
  // Only validate if not in not-found page generation
  if (process.env.NEXT_PRIVATE_SKIP_VALIDATION === "true") {
    return;
  }

  const missing = Object.entries(REQUIRED_ENV_VARS)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    // During build time, we'll skip the validation if we're in a script
    if (process.env.NODE_ENV === "production" && !process.env.IS_SCRIPT) {
      throw new Error(
        `Stream Chat environment variables are not configured. Missing: ${missing.join(", ")}`
      );
    }
    // For scripts, we'll just log a warning
    console.warn(
      `Warning: Missing Stream Chat environment variables: ${missing.join(", ")}`
    );
  }
}

export function getStreamConfig() {
  validateStreamEnv();
  return {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    apiKey: REQUIRED_ENV_VARS.NEXT_PUBLIC_STREAM_KEY!,
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    secret: REQUIRED_ENV_VARS.STREAM_SECRET!
  };
}
