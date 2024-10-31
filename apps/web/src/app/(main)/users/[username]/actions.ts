"use server";

import { getStreamClient } from "@/lib/stream";
import { validateRequest } from "@zephyr/auth/auth";
import {
  type UpdateUserProfileValues,
  updateUserProfileSchema
} from "@zephyr/auth/validation";
import { getUserDataSelect, prisma } from "@zephyr/db";

export async function updateUserProfile(values: UpdateUserProfileValues) {
  const validatedValues = updateUserProfileSchema.parse(values);

  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const streamClient = getStreamClient();

  const updatedUser = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: validatedValues,
      select: getUserDataSelect(user.id)
    });

    await streamClient.partialUpdateUser({
      id: user.id,
      set: {
        name: validatedValues.displayName
      }
    });

    return updatedUser;
  });

  return updatedUser;
}
