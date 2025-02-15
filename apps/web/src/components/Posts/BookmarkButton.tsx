import kyInstance from '@/lib/ky';
import { cn } from '@/lib/utils';
import {
  type QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { BookmarkInfo } from '@zephyr/db';
import { useToast } from '@zephyr/ui/hooks/use-toast';
import { Button } from '@zephyr/ui/shadui/button';
import { Bookmark } from 'lucide-react';

interface BookmarkButtonProps {
  postId: string;
  initialState: BookmarkInfo;
}

export default function BookmarkButton({
  postId,
  initialState,
}: BookmarkButtonProps) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const queryKey: QueryKey = ['bookmark-info', postId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/bookmark`).json<BookmarkInfo>(),
    initialData: initialState,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isBookmarkedByUser
        ? kyInstance.delete(`/api/posts/${postId}/bookmark`)
        : kyInstance.post(`/api/posts/${postId}/bookmark`),
    onMutate: async () => {
      toast({
        description: `Post ${data.isBookmarkedByUser ? 'un' : ''}bookmarked`,
      });

      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<BookmarkInfo>(queryKey);

      queryClient.setQueryData<BookmarkInfo>(queryKey, () => ({
        isBookmarkedByUser: !previousState?.isBookmarkedByUser,
      }));

      return { previousState };
    },
    onError(error, _variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: 'destructive',
        description: 'Something went wrong. Please try again.',
      });
    },
  });

  return (
    <Button
      variant="ghost"
      onClick={() => mutate()}
      className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
    >
      <Bookmark
        className={cn(
          'size-5',
          data.isBookmarkedByUser && 'fill-primary text-primary'
        )}
      />
    </Button>
  );
}
