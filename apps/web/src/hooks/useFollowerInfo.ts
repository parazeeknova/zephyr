import kyInstance from "@/lib/ky";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { FollowerInfo } from "@zephyr/db";

export function useFollowerInfo(userId: string, initialData: FollowerInfo) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["follower-info", userId],
    queryFn: async () => {
      const response = await kyInstance
        .get(`/api/users/${userId}/followers`)
        .json<FollowerInfo>();
      return response;
    },
    initialData,
    staleTime: 30000,
    // @ts-expect-error
    onSuccess: (data) => {
      queryClient.setQueriesData(
        { queryKey: ["follower-info"] },
        (oldData: any) => ({
          ...oldData,
          [userId]: data
        })
      );
    }
  });
}
