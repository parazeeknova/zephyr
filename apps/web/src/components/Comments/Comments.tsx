import kyInstance from '@/lib/ky';
import { useInfiniteQuery } from '@tanstack/react-query';
import CommentsSkeleton from '@zephyr-ui/Layouts/skeletons/CommentsSkeleton';
import type { CommentsPage, PostData } from '@zephyr/db';
import { Button } from '../ui/button';
import Comment from './Comment';
import CommentInput from './CommentInput';

interface CommentsProps {
  post: PostData;
}

export default function Comments({ post }: CommentsProps) {
  const { data, fetchNextPage, hasNextPage, isFetching, status } =
    useInfiniteQuery({
      queryKey: ['comments', post.id],
      queryFn: ({ pageParam }) =>
        kyInstance
          .get(
            `/api/posts/${post.id}/comments`,
            pageParam ? { searchParams: { cursor: pageParam } } : {}
          )
          .json<CommentsPage>(),
      initialPageParam: null as string | null,
      getNextPageParam: (firstPage) => firstPage.previousCursor,
      select: (data) => ({
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse(),
      }),
    });

  const comments = data?.pages.flatMap((page) => page.comments) || [];

  if (status === 'pending') {
    return <CommentsSkeleton />;
  }

  return (
    <div className="mt-4 space-y-3">
      <CommentInput post={post} />
      {hasNextPage && (
        <Button
          variant="link"
          className="mx-auto block"
          disabled={isFetching}
          onClick={() => fetchNextPage()}
        >
          Load previous eddies
        </Button>
      )}
      {status === 'success' && !comments.length && (
        <p className="text-center text-muted-foreground">No eddy yet.</p>
      )}
      {status === 'error' && (
        <p className="text-center text-destructive">
          An error occurred while loading eddies.
        </p>
      )}
      <div className="divide-y">
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
