import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";
import kyInstance from "@/lib/ky";
import type { PostData } from "@zephyr/db/prisma/client";

export function useVoteMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      postId,
      value
    }: { postId: string; value: number }) => {
      return kyInstance
        .post(`/api/posts/${postId}/vote`, { json: { value } })
        .json<PostData>();
    },
    onMutate: async ({ postId, value }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData<PostData[]>(["posts"]);

      if (previousPosts) {
        const updatedPosts = previousPosts.map((post) => {
          if (post.id === postId) {
            const currentUserVote = post.userVote?.value || 0;
            const newAura = post.aura + value - currentUserVote;
            return {
              ...post,
              aura: newAura,
              userVote: { value }
            };
          }
          return post;
        });
        queryClient.setQueryData(["posts"], updatedPosts);
      }

      return { previousPosts };
    },
    onError: (_err, _, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      toast({
        title: "Error",
        description: "Failed to update vote. Please try again.",
        variant: "destructive"
      });
    },
    onSuccess: (updatedPost) => {
      queryClient.setQueryData(
        ["posts"],
        (oldPosts: PostData[] | undefined) => {
          if (!oldPosts) return [updatedPost];
          return oldPosts.map((post) =>
            post.id === updatedPost.id ? updatedPost : post
          );
        }
      );
      toast({
        title: "Success",
        description: "Your vote has been recorded."
      });
    }
  });
}
