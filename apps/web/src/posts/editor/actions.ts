'use server';

import { createPostSchema, validateRequest } from '@zephyr/auth/src';
import type { CreatePostInput } from '@zephyr/auth/validation';
import {
  getPostDataInclude,
  postViewsCache,
  prisma,
  tagCache,
} from '@zephyr/db';

type ExtendedCreatePostInput = CreatePostInput & {
  hnStory?: {
    storyId: number;
    title: string;
    url?: string;
    by: string;
    time: number;
    score: number;
    descendants: number;
  };
};

const AURA_REWARDS = {
  BASE_POST: 10,
  HN_SHARE: 15, // Add a reward for sharing HN stories
  ATTACHMENTS: {
    IMAGE: {
      BASE: 20,
      PER_ITEM: 5,
      MAX_BONUS: 25, // Max bonus for multiple images (5 images)
    },
    VIDEO: {
      BASE: 40,
      PER_ITEM: 10,
      MAX_BONUS: 20, // Max bonus for multiple videos
    },
    AUDIO: {
      BASE: 25,
      PER_ITEM: 8,
      MAX_BONUS: 16, // Max bonus for multiple audio files
    },
    CODE: {
      BASE: 15,
      PER_ITEM: 15,
      MAX_BONUS: 45, // Max bonus for multiple code files
    },
  },
  MAX_TOTAL: 150, // Reasonable max total per post
};

type AttachmentType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'CODE';

async function calculateAuraReward(mediaIds: string[], hasHNStory: boolean) {
  let totalAura = hasHNStory
    ? AURA_REWARDS.BASE_POST + AURA_REWARDS.HN_SHARE
    : AURA_REWARDS.BASE_POST;

  if (!mediaIds.length) {
    return totalAura;
  }

  const mediaItems = await prisma.media.findMany({
    where: { id: { in: mediaIds } },
    select: { id: true, type: true },
  });

  const typeCount: Record<AttachmentType, number> = {
    IMAGE: 0,
    VIDEO: 0,
    AUDIO: 0,
    CODE: 0,
  };

  // biome-ignore lint/complexity/noForEach: This is a simple loop
  mediaItems.forEach((item) => {
    const type = item.type as AttachmentType;
    if (type in typeCount) {
      typeCount[type]++;
    }
  });

  // biome-ignore lint/complexity/noForEach: This is a simple loop
  Object.entries(typeCount).forEach(([type, count]) => {
    if (count > 0) {
      const config = AURA_REWARDS.ATTACHMENTS[type as AttachmentType];
      const baseReward = config.BASE;
      const bonusReward = Math.min(count * config.PER_ITEM, config.MAX_BONUS);
      totalAura += baseReward + bonusReward;
    }
  });

  return Math.min(totalAura, AURA_REWARDS.MAX_TOTAL);
}

export async function submitPost(input: ExtendedCreatePostInput) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const validatedInput = createPostSchema.parse({
      content: input.content,
      mediaIds: input.mediaIds || [],
      tags: input.tags || [],
      mentions: input.mentions || [],
    });

    const auraReward = await calculateAuraReward(
      validatedInput.mediaIds,
      !!input.hnStory
    );

    const newPost = await prisma.$transaction(async (tx) => {
      if (validatedInput.mentions.length > 0) {
        const validUsers = await tx.user.findMany({
          where: {
            id: {
              in: validatedInput.mentions,
            },
          },
          select: { id: true },
        });

        const validUserIds = validUsers.map((u) => u.id);
        validatedInput.mentions = validatedInput.mentions.filter((id) =>
          validUserIds.includes(id)
        );
      }

      const post = await tx.post.create({
        data: {
          content: validatedInput.content,
          userId: user.id,
          aura: 0,
          attachments: {
            connect: validatedInput.mediaIds.map((id) => ({ id })),
          },
          tags: {
            connectOrCreate: validatedInput.tags.map((tagName) => ({
              where: { name: tagName.toLowerCase() },
              create: { name: tagName.toLowerCase() },
            })),
          },
          mentions:
            validatedInput.mentions.length > 0
              ? {
                  create: validatedInput.mentions.map((userId) => ({
                    userId,
                  })),
                }
              : undefined,
        },
        include: {
          ...getPostDataInclude(user.id),
          tags: true,
          mentions: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          hnStoryShare: true,
        },
      });

      if (input.hnStory) {
        await tx.hNStoryShare.create({
          data: {
            postId: post.id,
            storyId: input.hnStory.storyId,
            title: input.hnStory.title,
            url: input.hnStory.url || null,
            by: input.hnStory.by,
            time: input.hnStory.time,
            score: input.hnStory.score,
            descendants: input.hnStory.descendants,
          },
        });
      }

      if (validatedInput.mentions.length > 0) {
        await Promise.all(
          validatedInput.mentions.map((userId) =>
            tx.notification.create({
              data: {
                type: 'MENTION',
                recipientId: userId,
                issuerId: user.id,
                postId: post.id,
              },
            })
          )
        );
      }

      await tx.user.update({
        where: { id: user.id },
        data: { aura: { increment: auraReward } },
      });

      await tx.auraLog.create({
        data: {
          userId: user.id,
          issuerId: user.id,
          amount: AURA_REWARDS.BASE_POST,
          type: 'POST_CREATION',
          postId: post.id,
        },
      });

      if (input.hnStory) {
        await tx.auraLog.create({
          data: {
            userId: user.id,
            issuerId: user.id,
            amount: AURA_REWARDS.HN_SHARE,
            type: 'POST_ATTACHMENT_BONUS',
            postId: post.id,
          },
        });
      }

      const attachmentBonus =
        auraReward -
        AURA_REWARDS.BASE_POST -
        (input.hnStory ? AURA_REWARDS.HN_SHARE : 0);
      if (attachmentBonus > 0) {
        await tx.auraLog.create({
          data: {
            userId: user.id,
            issuerId: user.id,
            amount: attachmentBonus,
            type: 'POST_ATTACHMENT_BONUS',
            postId: post.id,
          },
        });
      }

      const completePost = await tx.post.findUnique({
        where: { id: post.id },
        include: {
          ...getPostDataInclude(user.id),
          tags: true,
          mentions: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          hnStoryShare: true,
        },
      });

      return completePost;
    });

    return newPost;
  } catch (error) {
    console.error('Error in submitPost:', error);
    throw error;
  }
}

export async function incrementPostView(postId: string) {
  return await postViewsCache.incrementView(postId);
}

export async function getPostViews(postId: string) {
  return await postViewsCache.getViews(postId);
}

export async function updatePostTags(postId: string, tags: string[]) {
  const { user } = await validateRequest();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { tags: true },
  });

  if (!post) {
    throw new Error('Post not found');
  }
  if (post.userId !== user.id) {
    throw new Error('Unauthorized');
  }

  const oldTags = post.tags.map((t) => t.name);
  const tagsToAdd = tags.filter((t) => !oldTags.includes(t));
  const tagsToRemove = oldTags.filter((t) => !tags.includes(t));

  return await prisma.$transaction(async (tx) => {
    const updatedPost = await tx.post.update({
      where: { id: postId },
      data: {
        tags: {
          connectOrCreate: tagsToAdd.map((tagName) => ({
            where: { name: tagName },
            create: { name: tagName },
          })),
          disconnect: tagsToRemove.map((tagName) => ({ name: tagName })),
        },
      },
      include: getPostDataInclude(user.id),
    });

    await Promise.all([
      ...tagsToAdd.map((tagName) => tagCache.incrementTagCount(tagName)),
      ...tagsToRemove.map((tagName) => tagCache.decrementTagCount(tagName)),
    ]);

    return updatedPost;
  });
}

export async function updatePostMentions(postId: string, mentions: string[]) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { mentions: true },
    });

    if (!post) {
      throw new Error('Post not found');
    }
    if (post.userId !== user.id) {
      throw new Error('Unauthorized');
    }

    return await prisma.$transaction(async (tx) => {
      await tx.mention.deleteMany({
        where: { postId },
      });

      if (mentions.length > 0) {
        await tx.mention.createMany({
          data: mentions.map((userId) => ({
            postId,
            userId,
          })),
        });

        await tx.notification.createMany({
          data: mentions.map((userId) => ({
            type: 'MENTION',
            recipientId: userId,
            issuerId: user.id,
            postId,
          })),
        });
      }

      return await tx.post.findUnique({
        where: { id: postId },
        include: {
          ...getPostDataInclude(user.id),
          hnStoryShare: true,
        },
      });
    });
  } catch (error) {
    console.error('Error updating mentions:', error);
    throw error;
  }
}
