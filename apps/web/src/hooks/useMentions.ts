import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserData } from '@zephyr/db';

interface MentionsResponse {
  mentions: UserData[];
}

export function useMentions(postId?: string) {
  const queryClient = useQueryClient();

  const { data: mentions } = useQuery<MentionsResponse>({
    queryKey: ['mentions', postId],
    queryFn: async () => {
      if (!postId) {
        return { mentions: [] };
      }
      const res = await fetch(`/api/posts/${postId}/mentions`);
      if (!res.ok) {
        return { mentions: [] };
      }
      return res.json();
    },
    enabled: !!postId,
  });

  const updateMentions = useMutation({
    mutationFn: async (mentions: UserData[]) => {
      if (!postId) {
        return { mentions };
      }

      const res = await fetch(`/api/posts/${postId}/mentions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentions: mentions.map((m) => m.id) }),
      });

      if (!res.ok) {
        throw new Error('Failed to update mentions');
      }
      return res.json();
    },

    onMutate: async (newMentions) => {
      await queryClient.cancelQueries({ queryKey: ['mentions', postId] });
      const previousMentions = queryClient.getQueryData(['mentions', postId]);

      if (postId) {
        queryClient.setQueryData(['mentions', postId], {
          mentions: newMentions,
        });
      }

      return { previousMentions };
    },

    onError: (context) => {
      if (postId && context?.previousMentions) {
        queryClient.setQueryData(
          ['mentions', postId],
          context.previousMentions
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['mentions', postId] });
    },
  });

  return {
    mentions: mentions?.mentions ?? [],
    updateMentions,
  };
}
