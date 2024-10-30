import { Redis } from "@upstash/redis";

export const redis = new Redis({
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  url: process.env.UPSTASH_REDIS_REST_URL!,
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});
