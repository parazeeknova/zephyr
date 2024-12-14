import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";
import kyInstance from "@/lib/ky";
import type { FollowerInfo, UserData } from "@zephyr/db";

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
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["follower-info", userId] }),
        queryClient.cancelQueries({ queryKey: ["suggested-users"] }),
        queryClient.cancelQueries({ queryKey: ["user", userId] })
      ]);

      const previousData = {
        followerInfo: queryClient.getQueryData<FollowerInfo>([
          "follower-info",
          userId
        ]),
        suggestedUsers: queryClient.getQueryData<UserData[]>([
          "suggested-users"
        ])
      };

      queryClient.setQueryData<FollowerInfo>(
        ["follower-info", userId],
        (old) => ({
          followers: (old?.followers || 0) + 1,
          isFollowedByUser: true
        })
      );

      queryClient.setQueryData<UserData[]>(
        ["suggested-users"],
        (old) => old?.filter((user) => user.id !== userId) ?? []
      );

      return previousData;
    },
    onError: (_error, userId, context) => {
      if (context) {
        queryClient.setQueryData(
          ["follower-info", userId],
          context.followerInfo
        );
        queryClient.setQueryData(["suggested-users"], context.suggestedUsers);
      }
      toast({
        title: "Error",
        description: "Failed to follow user. Please try again.",
        variant: "destructive"
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `You are now following ${data.displayName}`
      });
    },
    onSettled: (_, userId) => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["follower-info", userId] }),
        queryClient.invalidateQueries({ queryKey: ["suggested-users"] }),
        queryClient.invalidateQueries({ queryKey: ["user", userId] })
      ]);
    }
  });
}

export function useUnfollowUserMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unfollowUser,
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["follower-info", userId] });
      await queryClient.cancelQueries({ queryKey: ["suggested-users"] });

      const previousFollowerInfo = queryClient.getQueryData<FollowerInfo>([
        "follower-info",
        userId
      ]);
      const previousSuggestedUsers = queryClient.getQueryData<UserData[]>([
        "suggested-users"
      ]);

      queryClient.setQueryData<FollowerInfo>(
        ["follower-info", userId],
        (old) => ({
          followers: Math.max((old?.followers || 1) - 1, 0),
          isFollowedByUser: false
        })
      );

      return { previousFollowerInfo, previousSuggestedUsers };
    },
    onError: (_error, userId, context) => {
      queryClient.setQueryData(
        ["follower-info", userId],
        context?.previousFollowerInfo
      );
      queryClient.setQueryData(
        ["suggested-users"],
        context?.previousSuggestedUsers
      );

      toast({
        title: "Error",
        description: "Failed to unfollow user. Please try again.",
        variant: "destructive"
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `You have unfollowed ${data.displayName}`
      });
    },
    onSettled: (_, __, userId) => {
      queryClient.invalidateQueries({ queryKey: ["follower-info", userId] });
      queryClient.invalidateQueries({ queryKey: ["suggested-users"] });
    }
  });
}
