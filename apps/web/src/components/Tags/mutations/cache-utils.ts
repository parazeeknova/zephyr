import type { QueryClient } from '@tanstack/react-query';
import type { PostData } from '@zephyr/db';

export function updatePostInCaches(
  queryClient: QueryClient,
  postId: string,
  updater: (post: PostData) => PostData
) {
  queryClient.setQueryData(['post', postId], updater);

  // biome-ignore lint/complexity/noForEach: ignore
  ['post-feed', 'posts:for-you', 'posts:following'].forEach((key) => {
    queryClient.setQueryData(
      [key],
      (oldData: { pages: { posts: PostData[] }[] } | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post) =>
              post.id === postId ? updater(post) : post
            ),
          })),
        };
      }
    );
  });
}
