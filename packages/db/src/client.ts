import type { Prisma } from "@prisma/client";

export function getUserDataSelect(loggedInUserId: string) {
  return {
    id: true,
    username: true,
    email: true,
    displayName: true,
    avatarUrl: true,
    avatarKey: true,
    bio: true,
    createdAt: true,
    googleId: true,
    githubId: true,
    discordId: true,
    twitterId: true,
    passwordHash: true,
    emailVerified: true,
    followers: {
      where: {
        followerId: loggedInUserId
      },
      select: {
        followerId: true
      }
    },
    _count: {
      select: {
        posts: true,
        followers: true,
        following: true
      }
    }
  } satisfies Prisma.UserSelect;
}

export function getPostDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId)
    },
    attachments: true,
    bookmarks: {
      where: {
        userId: loggedInUserId
      },
      select: {
        userId: true
      }
    },
    vote: {
      where: {
        userId: loggedInUserId
      },
      select: {
        userId: true,
        value: true
      }
    },
    _count: {
      select: {
        vote: true,
        comments: true
      }
    }
  } satisfies Prisma.PostInclude;
}

export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>;
}>;

export interface PostsPage {
  posts: PostData[];
  nextCursor: string | null;
}

export function getCommentDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId)
    }
  } satisfies Prisma.CommentInclude;
}

export type CommentData = Prisma.CommentGetPayload<{
  include: ReturnType<typeof getCommentDataInclude>;
}>;

export interface CommentsPage {
  comments: CommentData[];
  previousCursor: string | null;
}

export const notificationsInclude = {
  issuer: {
    select: {
      username: true,
      displayName: true,
      avatarUrl: true
    }
  },
  post: {
    select: {
      content: true
    }
  }
} satisfies Prisma.NotificationInclude;

export type NotificationData = Prisma.NotificationGetPayload<{
  include: typeof notificationsInclude;
}>;

export interface NotificationsPage {
  notifications: NotificationData[];
  nextCursor: string | null;
}

export interface FollowerInfo {
  followers: number;
  isFollowedByUser: boolean;
}

export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}> & {
  aura: number;
};

export interface VoteInfo {
  aura: number;
  userVote: number;
}

export interface BookmarkInfo {
  isBookmarkedByUser: boolean;
}

export interface NotificationCountInfo {
  unreadCount: number;
}

export interface MessageCountInfo {
  unreadCount: number;
  error?: string;
}

export interface ShareStats {
  platform: string;
  shares: number;
  clicks: number;
}

export interface ShareResponse {
  shares: number;
}

export interface ClickResponse {
  clicks: number;
}
