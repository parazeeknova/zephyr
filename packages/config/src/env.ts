export function validateEnv() {
  const requiredEnvVars = [
    "NEXT_PUBLIC_STREAM_KEY",
    "STREAM_SECRET"
    // Add other required environment variables here
  ] as const;

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}

export const getStreamConfig = () => ({
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  apiKey: process.env.NEXT_PUBLIC_STREAM_KEY!,
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  secret: process.env.STREAM_SECRET!
});
