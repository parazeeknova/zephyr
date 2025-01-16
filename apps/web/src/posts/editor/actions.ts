"use server";

"use server";

import { validateRequest } from "@zephyr/auth/auth";
import { createPostSchema } from "@zephyr/auth/validation";
import { getPostDataInclude, postViewsCache, prisma } from "@zephyr/db";

const AURA_REWARDS = {
  BASE_POST: 10,
  ATTACHMENTS: {
    IMAGE: {
      BASE: 20,
      PER_ITEM: 5,
      MAX_BONUS: 25 // Max bonus for multiple images (5 images)
    },
    VIDEO: {
      BASE: 40,
      PER_ITEM: 10,
      MAX_BONUS: 20 // Max bonus for multiple videos
    },
    AUDIO: {
      BASE: 25,
      PER_ITEM: 8,
      MAX_BONUS: 16 // Max bonus for multiple audio files
    },
    CODE: {
      BASE: 15,
      PER_ITEM: 15,
      MAX_BONUS: 45 // Max bonus for multiple code files
    }
  },
  MAX_TOTAL: 150 // Reasonable max total per post
};

type AttachmentType = "IMAGE" | "VIDEO" | "AUDIO" | "CODE";

async function calculateAuraReward(mediaIds: string[]) {
  if (!mediaIds.length) return AURA_REWARDS.BASE_POST;

  const mediaItems = await prisma.media.findMany({
    where: { id: { in: mediaIds } },
    select: { id: true, type: true }
  });

  let totalAura = AURA_REWARDS.BASE_POST;
  const typeCount: Record<AttachmentType, number> = {
    IMAGE: 0,
    VIDEO: 0,
    AUDIO: 0,
    CODE: 0
  };

  // Count items by type
  // biome-ignore lint/complexity/noForEach: This is a simple loop
  mediaItems.forEach((item) => {
    const type = item.type as AttachmentType;
    if (type in typeCount) {
      typeCount[type]++;
    }
  });

  // Calculate rewards for each type
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

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
}) {
  const { user } = await validateRequest();

  if (!user) throw Error("Unauthorized");

  const { content, mediaIds } = createPostSchema.parse(input);

  const auraReward = await calculateAuraReward(mediaIds);

  const newPost = await prisma.$transaction(async (tx) => {
    const post = await tx.post.create({
      data: {
        content,
        userId: user.id,
        aura: 0,
        attachments: {
          connect: mediaIds.map((id: string) => ({ id }))
        }
      },
      include: getPostDataInclude(user.id)
    });

    await tx.user.update({
      where: { id: user.id },
      data: { aura: { increment: auraReward } }
    });

    await tx.auraLog.create({
      data: {
        userId: user.id,
        issuerId: user.id,
        amount: AURA_REWARDS.BASE_POST,
        type: "POST_CREATION",
        postId: post.id
      }
    });

    if (auraReward > AURA_REWARDS.BASE_POST) {
      await tx.auraLog.create({
        data: {
          userId: user.id,
          issuerId: user.id,
          amount: auraReward - AURA_REWARDS.BASE_POST,
          type: "POST_ATTACHMENT_BONUS",
          postId: post.id
        }
      });
    }

    return { post, auraReward };
  });

  return newPost.post;
}

export async function incrementPostView(postId: string) {
  return await postViewsCache.incrementView(postId);
}

export async function getPostViews(postId: string) {
  return await postViewsCache.getViews(postId);
}
