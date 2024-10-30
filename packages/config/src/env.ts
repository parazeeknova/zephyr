export const streamEnvs = {
  apiKey: process.env.NEXT_PUBLIC_STREAM_KEY,
  secret: process.env.STREAM_SECRET
} as const;

export function validateStreamEnv() {
  if (!streamEnvs.apiKey || !streamEnvs.secret) {
    // During build time, skip the validation if we're in a script
    if (process.env.NODE_ENV === "production" && !process.env.IS_SCRIPT) {
      throw new Error(
        "Stream Chat environment variables are not configured. " +
          "Please set NEXT_PUBLIC_STREAM_KEY and STREAM_SECRET"
      );
    }
    // For scripts, just log a warning
    console.warn(
      "Stream Chat environment variables are not configured. " +
        "This is OK if you're running a script."
    );
  }
}

export function getStreamConfig() {
  validateStreamEnv();
  return {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    apiKey: streamEnvs.apiKey!,
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    secret: streamEnvs.secret!
  };
}
