import { Discord, GitHub, Google, Twitter } from "arctic";

export const google = new Google(
  // biome-ignore lint/style/noNonNullAssertion: Required for auth
  process.env.GOOGLE_CLIENT_ID!,
  // biome-ignore lint/style/noNonNullAssertion: Required for auth
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/google`
);

export const github = new GitHub(
  // biome-ignore lint/style/noNonNullAssertion: Required for auth
  process.env.GITHUB_CLIENT_ID!,
  // biome-ignore lint/style/noNonNullAssertion: Required for auth
  process.env.GITHUB_CLIENT_SECRET!,
  `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/github`
);

export const discord = new Discord(
  // biome-ignore lint/style/noNonNullAssertion: Required for auth
  process.env.DISCORD_CLIENT_ID!,
  // biome-ignore lint/style/noNonNullAssertion: Required for auth
  process.env.DISCORD_CLIENT_SECRET!,
  `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/discord`
);

export const twitter = new Twitter(
  // biome-ignore lint/style/noNonNullAssertion: Required for auth
  process.env.TWITTER_CLIENT_ID!,
  // biome-ignore lint/style/noNonNullAssertion: Required for auth
  process.env.TWITTER_CLIENT_SECRET!,
  `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/twitter`
);
