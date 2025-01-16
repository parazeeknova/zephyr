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
    mutationFn: (input: PostInput) => submitPost(input),
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
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor
                },
                ...oldData.pages.slice(1)
              ]
            };
          }
        }
      );

      queryClient.invalidateQueries({ queryKey: ["popularTags"] });

      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return !query.state.data;
        }
      });

      toast({
        title: "Post created successfully!",
        description: "Your post is now live ✨",
        duration: 5000
      });
    },
    onError(error) {
      console.log(error);
      toast({
        variant: "destructive",
        description: "Failed to post. Please try again."
      });
    }
  });

  return mutation;
}
