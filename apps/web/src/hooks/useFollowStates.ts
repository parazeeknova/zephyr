import { useQuery } from '@tanstack/react-query';
import type { FollowerInfo } from '@zephyr/db';

export function useFollowStates(userIds: string[]) {
  return useQuery({
    queryKey: ['follow-states', userIds],
    queryFn: async () => {
      const response = await fetch('/api/users/follow-states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds }),
      });
      return response.json() as Promise<Record<string, FollowerInfo>>;
    },
    enabled: userIds.length > 0,
  });
}
