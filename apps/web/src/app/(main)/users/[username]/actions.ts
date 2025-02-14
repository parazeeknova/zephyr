'use server';

import { validateRequest } from '@zephyr/auth/auth';
import { getStreamClient } from '@zephyr/auth/src';
import {
  type UpdateUserProfileValues,
  updateUserProfileSchema,
} from '@zephyr/auth/validation';
import { getUserDataSelect, prisma } from '@zephyr/db';

export async function updateUserProfile(values: UpdateUserProfileValues) {
  const validatedValues = updateUserProfileSchema.parse(values);
  const { user } = await validateRequest();

  if (!user) throw new Error('Unauthorized');

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: validatedValues,
      select: getUserDataSelect(user.id),
    });

    try {
      const streamClient = getStreamClient();
      if (streamClient) {
        await streamClient.partialUpdateUser({
          id: user.id,
          set: {
            name: validatedValues.displayName,
          },
        });
      }
    } catch (streamError) {
      console.error('Failed to update Stream user:', streamError);
    }

    return updatedUser;
  } catch (error) {
    console.error('Failed to update user profile:', error);
    throw new Error('Failed to update profile');
  }
}
