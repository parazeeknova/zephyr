import { useToast } from '@/hooks/use-toast';
import { getSecureImageUrl } from '@/utils/imageUrl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateUserProfileValues } from '@zephyr/auth/validation';
import type { UserData } from '@zephyr/db';

interface UpdateProfilePayload {
  values: UpdateUserProfileValues;
  userId: string;
}

interface UpdateAvatarPayload {
  file: File;
  userId: string;
  oldAvatarKey?: string;
}

export function useUpdateAvatarMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, userId, oldAvatarKey }: UpdateAvatarPayload) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      if (oldAvatarKey) formData.append('oldAvatarKey', oldAvatarKey);

      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error((await response.text()) || 'Failed to update avatar');
      }

      const data = await response.json();
      return data;
    },
    onMutate: async ({ file, userId }) => {
      await queryClient.cancelQueries({ queryKey: ['user', userId] });
      await queryClient.cancelQueries({ queryKey: ['avatar', userId] });

      const previousUser = queryClient.getQueryData<UserData>(['user', userId]);
      const previousAvatar = queryClient.getQueryData(['avatar', userId]);
      const optimisticUrl = URL.createObjectURL(file);

      queryClient.setQueryData(['user', userId], (old: any) => ({
        ...old,
        avatarUrl: optimisticUrl,
      }));

      queryClient.setQueryData(['avatar', userId], {
        url: optimisticUrl,
        key: null,
      });

      return { previousUser, previousAvatar };
    },
    onSuccess: (data, { userId }) => {
      const secureUrl = getSecureImageUrl(data.avatar.url);

      queryClient.setQueryData(['user', userId], (old: any) => ({
        ...old,
        avatarUrl: secureUrl,
        avatarKey: data.avatar.key,
      }));

      queryClient.setQueryData(['avatar', userId], {
        url: secureUrl,
        key: data.avatar.key,
      });

      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['avatar', userId] });
      queryClient.invalidateQueries({ queryKey: ['post-feed'] });

      toast({
        title: 'Success',
        description: 'Avatar updated successfully',
      });
    },
    onError: (error, _, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(
          ['user', context.previousUser.id],
          context.previousUser
        );
      }
      if (context?.previousAvatar) {
        queryClient.setQueryData(
          ['avatar', context.previousUser?.id],
          context.previousAvatar
        );
      }

      toast({
        title: 'Error',
        description: error.message || 'Failed to update avatar',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ values, userId }: UpdateProfilePayload) => {
      try {
        const formData = new FormData();
        formData.append('values', JSON.stringify(values));
        formData.append('userId', userId);

        const response = await fetch('/api/users/profile', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || 'Failed to update profile');
        }

        const data = await response.json();
        return data.user;
      } catch (error) {
        console.error('Profile update error:', error);
        throw error;
      }
    },
    onMutate: async ({ values, userId }) => {
      await queryClient.cancelQueries({ queryKey: ['user', userId] });
      const previousUser = queryClient.getQueryData<UserData>(['user', userId]);

      if (previousUser) {
        const optimisticUser = {
          ...previousUser,
          displayName: values.displayName,
          bio: values.bio,
        };
        queryClient.setQueryData(['user', userId], optimisticUser);
      }

      return { previousUser };
    },
    onSuccess: (updatedUser, { userId }) => {
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });

      queryClient.setQueryData(['user', userId], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['post-feed'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
    onError: (error, _, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(
          ['user', context.previousUser.id],
          context.previousUser
        );
      }
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });
}
