import { deleteAvatar, uploadAvatar } from "@/lib/minio";
import { getStreamClient } from "@/lib/stream";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateUserProfileValues } from "@zephyr/auth/validation";
import { prisma } from "@zephyr/db";

export function useUpdateAvatarMutation() {
  const queryClient = useQueryClient();
  const streamClient = getStreamClient();

  return useMutation({
    mutationFn: async ({
      file,
      userId,
      oldAvatarKey
    }: {
      file: File;
      userId: string;
      oldAvatarKey?: string;
    }) => {
      const result = await uploadAvatar(file, userId);
      if (oldAvatarKey) {
        await deleteAvatar(oldAvatarKey);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          avatarUrl: result.url,
          avatarKey: result.key
        }
      });

      await streamClient.partialUpdateUser({
        id: userId,
        set: {
          image: result.url
        }
      });

      return {
        user: updatedUser,
        avatar: result
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["post-feed"] });
    }
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const streamClient = getStreamClient();

  return useMutation({
    mutationFn: async ({
      values,
      avatar,
      userId,
      oldAvatarKey
    }: {
      values: UpdateUserProfileValues;
      avatar?: File;
      userId: string;
      oldAvatarKey?: string;
    }) => {
      // biome-ignore lint/suspicious/noImplicitAnyLet: Will be fixed in a future PR
      let avatarResult;

      if (avatar) {
        avatarResult = await uploadAvatar(avatar, userId);
        if (oldAvatarKey) {
          await deleteAvatar(oldAvatarKey);
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          displayName: values.displayName,
          bio: values.bio,
          ...(avatarResult && {
            avatarUrl: avatarResult.url,
            avatarKey: avatarResult.key
          })
        }
      });

      if (avatarResult) {
        await streamClient.partialUpdateUser({
          id: userId,
          set: {
            image: avatarResult.url
          }
        });
      }

      return {
        user: updatedUser,
        avatar: avatarResult
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["post-feed"] });
    }
  });
}
