import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateUserProfileValues } from "@zephyr/auth/validation";

export function useUpdateAvatarMutation() {
  const queryClient = useQueryClient();

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
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);
      if (oldAvatarKey) {
        formData.append("oldAvatarKey", oldAvatarKey);
      }

      const response = await fetch("/api/users/avatar", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to update avatar");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["post-feed"] });
    }
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

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
      const formData = new FormData();
      formData.append("values", JSON.stringify(values));
      if (avatar) {
        formData.append("avatar", avatar);
      }
      formData.append("userId", userId);
      if (oldAvatarKey) {
        formData.append("oldAvatarKey", oldAvatarKey);
      }

      const response = await fetch("/api/users/profile", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["post-feed"] });
    }
  });
}
