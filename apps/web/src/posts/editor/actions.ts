"use server";

import { validateRequest } from "@zephyr/auth/auth";
import { createPostSchema } from "@zephyr/auth/validation";
import { getPostDataInclude, prisma } from "@zephyr/db";

export async function submitPost(input: string) {
  const { user } = await validateRequest();

  if (!user) throw Error("Unauthorized");

  const { content } = createPostSchema.parse({ content: input });

  const newPost = await prisma.post.create({
    data: {
      content,
      userId: user.id
    },
    include: getPostDataInclude(user.id)
  });

  return newPost;
}
