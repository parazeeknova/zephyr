import { useQuery } from "@tanstack/react-query";

import kyInstance from "@/lib/ky";
import type { FollowerInfo, UserData } from "@zephyr/db";

export default function useFollowerInfo(
  userId: string,
  initialState: FollowerInfo
) {
  const query = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () =>
      kyInstance.get(`/api/users/${userId}/followers`).json<FollowerInfo>(),
    initialData: initialState,
    staleTime: Number.POSITIVE_INFINITY
  });

  return query;
}

export function useFollowedUsers() {
  return useQuery({
    queryKey: ["followed-users"],
    queryFn: () => kyInstance.get("/api/users/followed").json<UserData[]>()
  });
}
