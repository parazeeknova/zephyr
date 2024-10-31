"use server";

import { validateRequest } from "@zephyr/auth/auth";
import { createPostSchema } from "@zephyr/auth/validation";
import { getPostDataInclude, postViewsCache, prisma } from "@zephyr/db";

export async function incrementPostView(postId: string) {
  return await postViewsCache.incrementView(postId);
}

export async function getPostViews(postId: string) {
  return await postViewsCache.getViews(postId);
}

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
}) {
  const { user } = await validateRequest();

  if (!user) throw Error("Unauthorized");

  const { content, mediaIds } = createPostSchema.parse(input);

  const newPost = await prisma.post.create({
    data: {
      content,
      userId: user.id,
      attachments: {
        connect: mediaIds.map((id: string) => ({ id }))
      }
    },
    include: getPostDataInclude(user.id)
  });

  return newPost;
}
