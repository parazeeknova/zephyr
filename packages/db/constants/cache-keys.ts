export const CACHE_KEYS = {
  followerInfo: (userId: string) => `follower-info:${userId}`,
  suggestedUsers: (userId: string) => `suggested-users:${userId}`,
  user: (userId: string) => `user:${userId}`,
  userProfile: (userId: string) => `user-profile:${userId}`,
} as const;
