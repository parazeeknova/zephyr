import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";
import kyInstance from "@/lib/ky";
import type { UserData } from "@zephyr/db/prisma/client";

async function followUser(userId: string): Promise<UserData> {
  return kyInstance.post(`/api/users/${userId}/followers`).json<UserData>();
}

async function unfollowUser(userId: string): Promise<UserData> {
  return kyInstance.delete(`/api/users/${userId}/followers`).json<UserData>();
}

export function useFollowUserMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followUser,
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["followed-users"] });
      await queryClient.cancelQueries({ queryKey: ["suggested-connections"] });
      const previousFollowedUsers =
        queryClient.getQueryData<UserData[]>(["followed-users"]) || [];
      const previousSuggestedConnections =
        queryClient.getQueryData<UserData[]>(["suggested-connections"]) || [];

      const userToFollow = previousSuggestedConnections.find(
        (user) => user.id === userId
      );

      if (userToFollow) {
        queryClient.setQueryData<UserData[]>(["followed-users"], (old) => [
          ...(old || []),
          userToFollow
        ]);
        queryClient.setQueryData<UserData[]>(["suggested-connections"], (old) =>
          (old || []).filter((user) => user.id !== userId)
        );
      }

      return {
        previousFollowedUsers,
        previousSuggestedConnections,
        userToFollow
      };
    },
    onError: (_err, _userId, context) => {
      queryClient.setQueryData(
        ["followed-users"],
        context?.previousFollowedUsers
      );
      queryClient.setQueryData(
        ["suggested-connections"],
        context?.previousSuggestedConnections
      );
      toast({
        title: "Error",
        description: "Failed to follow user. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    },
    onSuccess: (followedUser, _userId, context) => {
      const displayName =
        context?.userToFollow?.displayName || followedUser.displayName;
      toast({
        title: "Success",
        description: `You are now following ${displayName}`,
        duration: 3000
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["followed-users"] });
      queryClient.invalidateQueries({ queryKey: ["suggested-connections"] });
    }
  });
}

export function useUnfollowUserMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unfollowUser,
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["followed-users"] });
      await queryClient.cancelQueries({ queryKey: ["suggested-connections"] });
      const previousFollowedUsers =
        queryClient.getQueryData<UserData[]>(["followed-users"]) || [];
      const previousSuggestedConnections =
        queryClient.getQueryData<UserData[]>(["suggested-connections"]) || [];

      const userToUnfollow = previousFollowedUsers.find(
        (user) => user.id === userId
      );

      if (userToUnfollow) {
        queryClient.setQueryData<UserData[]>(["followed-users"], (old) =>
          (old || []).filter((user) => user.id !== userId)
        );
        queryClient.setQueryData<UserData[]>(
          ["suggested-connections"],
          (old) => [...(old || []), userToUnfollow]
        );
      }

      return {
        previousFollowedUsers,
        previousSuggestedConnections,
        userToUnfollow
      };
    },
    onError: (_err, _userId, context) => {
      queryClient.setQueryData(
        ["followed-users"],
        context?.previousFollowedUsers
      );
      queryClient.setQueryData(
        ["suggested-connections"],
        context?.previousSuggestedConnections
      );
      toast({
        title: "Error",
        description: "Failed to unfollow user. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    },
    onSuccess: (unfollowedUser, _userId, context) => {
      const displayName =
        context?.userToUnfollow?.displayName || unfollowedUser.displayName;
      toast({
        title: "Success",
        description: `You have unfollowed ${displayName}`,
        duration: 3000
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["followed-users"] });
      queryClient.invalidateQueries({ queryKey: ["suggested-connections"] });
    }
  });
}
