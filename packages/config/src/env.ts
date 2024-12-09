const REQUIRED_ENV_VARS = {
  NEXT_PUBLIC_STREAM_KEY: process.env.NEXT_PUBLIC_STREAM_KEY,
  STREAM_SECRET: process.env.STREAM_SECRET
} as const;

export function validateStreamEnv() {
  if (
    process.env.NEXT_PUBLIC_SKIP_VALIDATION === "true" ||
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return;
  }

  const missing = Object.entries(REQUIRED_ENV_VARS)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Stream Chat environment variables are not configured. Missing: ${missing.join(", ")}`
    );
  }
}

export function getStreamConfig() {
  validateStreamEnv();

  const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY;
  const secret = process.env.STREAM_SECRET;

  if (!apiKey || !secret) {
    throw new Error("Stream configuration is missing required values");
  }

  return { apiKey, secret };
}

export function isStreamConfigured() {
  console.log("Stream env check:", {
    hasApiKey: !!process.env.NEXT_PUBLIC_STREAM_KEY,
    hasSecret: !!process.env.STREAM_SECRET
  });

  return !!(process.env.NEXT_PUBLIC_STREAM_KEY && process.env.STREAM_SECRET);
}
