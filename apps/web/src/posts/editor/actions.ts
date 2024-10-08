"use server";

import { validateRequest } from "@zephyr/auth/auth";
import { createPostSchema } from "@zephyr/auth/validation";
import prisma from "@zephyr/db/prisma";
import { getPostDataInclude } from "@zephyr/db/prisma/client";

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
