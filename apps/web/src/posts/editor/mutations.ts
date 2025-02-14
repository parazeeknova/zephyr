import { useToast } from '@/hooks/use-toast';
import {
  type InfiniteData,
  type QueryFilters,
  type QueryKey,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { PostsPage } from '@zephyr/db';
import { submitPost, updatePostMentions } from './actions';

interface PostInput {
  content: string;
  mediaIds: string[];
  tags: string[];
  mentions: string[];
}

export function useSubmitPostMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: PostInput) => {
      const payload = {
        content: input.content,
        mediaIds: input.mediaIds || [],
        tags: input.tags || [],
        mentions: Array.isArray(input.mentions)
          ? input.mentions.filter(Boolean)
          : [],
      };

      const response = await submitPost(payload);
      if (!response) {
        throw new Error('Failed to create post');
      }
      return response;
    },
    onSuccess: async (newPost) => {
      const queryFilter: QueryFilters<
        InfiniteData<PostsPage, string | null>,
        Error,
        InfiniteData<PostsPage, string | null>,
        QueryKey
      > = { queryKey: ['post-feed', 'for-you'] };

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
                nextCursor: oldData.pages[0].nextCursor,
              },
              ...oldData.pages.slice(1),
            ],
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ['popularTags'] });

      toast({
        title: 'Post created successfully!',
        description: 'Your post is now live ✨',
        duration: 5000,
      });
    },
    onError(error) {
      console.error('Post creation error:', error);
      toast({
        variant: 'destructive',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to create post. Please try again.',
      });
    },
  });

  return mutation;
}

export function useUpdateMentionsMutation(postId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mentions: string[]) => {
      if (!postId) {
        throw new Error('Post ID is required to update mentions');
      }
      const response = await updatePostMentions(postId, mentions);
      if (!response) {
        throw new Error('Failed to update mentions');
      }
      return response;
    },
    onSuccess: (updatedPost) => {
      if (postId) {
        queryClient.setQueryData(['post', postId], updatedPost);
      }
      toast({
        title: 'Mentions updated',
        description: 'The mentioned users have been notified',
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Failed to update mentions:', error);
      toast({
        variant: 'destructive',
        description: 'Failed to update mentions. Please try again.',
      });
    },
  });
}
