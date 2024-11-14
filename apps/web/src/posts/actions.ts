"use server";

import {
  POST_VIEWS_KEY_PREFIX,
  POST_VIEWS_SET,
  getPostDataInclude,
  prisma,
  redis
} from "@zephyr/db";

import { validateRequest } from "@zephyr/auth/auth";

export async function deletePost(id: string) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const post = await prisma.post.findUnique({
    where: { id }
  });

  if (!post) throw new Error("Post not found");

  if (post.userId !== user.id) throw new Error("Unauthorized");

  const deletedPost = await prisma.post.delete({
    where: { id },
    include: getPostDataInclude(user.id)
  });

  try {
    await Promise.all([
      redis.srem(POST_VIEWS_SET, id),
      redis.del(`${POST_VIEWS_KEY_PREFIX}${id}`)
    ]);
  } catch (error) {
    console.error("Error cleaning up Redis cache for deleted post:", error);
  }

  return deletedPost;
}
