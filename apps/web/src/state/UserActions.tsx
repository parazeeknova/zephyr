"use server";

import { validateRequest } from "@zephyr/auth/auth";
import prisma from "@zephyr/db/prisma";

export async function getSuggestedConnections() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const suggestedUsers = await prisma.user.findMany({
      where: {
        NOT: {
          OR: [
            { id: user.id },
            {
              followers: {
                some: {
                  followerId: user.id
                }
              }
            }
          ]
        }
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        _count: {
          select: {
            followers: true
          }
        }
      },
      take: 5
    });

    return JSON.parse(JSON.stringify(suggestedUsers));
  } catch (error) {
    console.error("Error in getSuggestedConnections:", error);
    throw new Error("Failed to fetch suggested connections");
  }
}
