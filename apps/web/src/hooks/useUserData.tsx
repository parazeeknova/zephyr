import { getUserDataSelect, prisma } from "@zephyr/db";
import { cache } from "react";

export const getUserData = cache(async (userId: string) => {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    select: getUserDataSelect(userId)
  });

  return userData;
});
