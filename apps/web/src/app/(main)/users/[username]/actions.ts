"use server";

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

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: validatedValues,
    select: getUserDataSelect(user.id)
  });

  return updatedUser;
}
