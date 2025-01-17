import { useToast } from "@/hooks/use-toast";
import {
  type InfiniteData,
  type QueryFilters,
  type QueryKey,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import type { PostsPage } from "@zephyr/db";
import { submitPost } from "./actions";

interface PostInput {
  content: string;
  mediaIds: string[];
  tags: string[];
}

export function useSubmitPostMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: PostInput) => {
      const response = await submitPost(input);
      if (!response) {
        throw new Error("Failed to create post");
      }
      return response;
    },
    onSuccess: async (newPost) => {
      const queryFilter: QueryFilters<
        InfiniteData<PostsPage, string | null>,
        Error,
        InfiniteData<PostsPage, string | null>,
        QueryKey
      > = { queryKey: ["post-feed", "for-you"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData?.pages[0]) return oldData;

          return {
            pageParams: oldData.pageParams,
            pages: [
              {
                posts: [newPost, ...oldData.pages[0].posts],
                nextCursor: oldData.pages[0].nextCursor
              },
              ...oldData.pages.slice(1)
            ]
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ["popularTags"] });

      toast({
        title: "Post created successfully!",
        description: "Your post is now live ✨",
        duration: 5000
      });
    },
    onError(error) {
      console.error("Post creation error:", error);
      toast({
        variant: "destructive",
        description: "Failed to create post. Please try again."
      });
    }
  });

  return mutation;
}
